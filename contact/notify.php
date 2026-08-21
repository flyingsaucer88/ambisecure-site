<?php
/**
 * AmbiSecure enquiry notification — Microsoft Graph, application-only OAuth.
 *
 * WHY THIS REPLACED mail()
 * ------------------------
 * Hostinger's PHP `mail()` returns false on this host: no local MTA accepts
 * the message, so no notification ever left the server. Production evidence was
 * a run of `LEAD_CAPTURED MAIL_FAILED` lines in the ops log. That is a missing
 * transport, not an SPF problem — nothing was ever emitted for SPF to judge.
 * No DNS change fixes it, so none was made.
 *
 * The replacement authenticates to Microsoft 365 and hands the message to
 * Graph over HTTPS. Nothing needs outbound SMTP, and the mail is sent by
 * Microsoft's own infrastructure, so it inherits ambimat.com's existing SPF and
 * DKIM alignment instead of fighting it.
 *
 * AUTHORISATION MODEL (deliberately narrow)
 * -----------------------------------------
 * The Entra app "AmbiSecure Website Inquiry Mailer" holds NO Microsoft Graph
 * API permissions at all. Authorisation comes solely from Exchange Online RBAC
 * for Applications: role `Application Mail.Send`, confined by a management
 * scope that matches one mailbox by its immutable directory GUID. Entra API
 * permissions and Exchange RBAC are ADDITIVE, so granting tenant-wide Graph
 * Mail.Send here would silently defeat the scope — it is intentionally absent.
 *
 * Proven with Test-ServicePrincipalAuthorization:
 *   business.development@ambimat.com  InScope = True
 *   every other mailbox               InScope = False
 *
 * SECRETS
 * -------
 * Credentials are read from an env-style file that lives OUTSIDE the web root
 * and is never committed, never packaged, and never logged. The endpoint fails
 * closed (notification skipped, lead still stored) if it is absent.
 */

declare(strict_types=1);

/** Config keys that must be present and non-empty for a send to be attempted. */
const M365_REQUIRED_KEYS = [
    'AZURE_TENANT_ID',
    'AZURE_CLIENT_ID',
    'AZURE_CLIENT_SECRET',
    'MAIL_SEND_AS',
    'MAIL_FROM_ALIAS',
    'MAIL_NOTIFY_TO',
];

/** Keep a Graph outage from holding the visitor's form response open. */
const M365_CONNECT_TIMEOUT = 5;
const M365_TOTAL_TIMEOUT   = 12;

/**
 * Candidate locations for the credential file, most-preferred first.
 *
 * The Hostinger FTP deploy account is scoped to public_html and cannot write
 * above it, which is exactly why this path is safe: the file cannot be
 * clobbered by a release, and no release can accidentally publish it.
 *
 * $docRoot is the deployed web root (public_html). Its parent is the account
 * home directory — readable by PHP, unreachable over HTTP.
 */
function m365_config_paths(string $docRoot): array
{
    $paths = [];
    $env = getenv('AMBISECURE_MAIL_CONFIG');
    if (is_string($env) && $env !== '') {
        $paths[] = $env;                                  // explicit override (tests)
    }
    $docRoot = rtrim($docRoot, '/');
    if ($docRoot !== '') {
        $paths[] = dirname($docRoot) . '/.ambisecure-mail.env';
    }
    return $paths;
}

/**
 * Parse a KEY=VALUE file. No interpolation, no shell semantics — a value is
 * whatever follows the first '=' on the line, verbatim. Blank lines and
 * '#' comments are skipped.
 *
 * @return array<string,string>
 */
function m365_parse_env(string $raw): array
{
    $out = [];
    foreach (preg_split('/\R/', $raw) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') {
            continue;
        }
        $eq = strpos($line, '=');
        if ($eq === false) {
            continue;
        }
        $key = trim(substr($line, 0, $eq));
        $val = trim(substr($line, $eq + 1));
        // Tolerate quoted values without letting a quote leak into the secret.
        $len = strlen($val);
        if ($len >= 2
            && (($val[0] === '"' && $val[$len - 1] === '"')
                || ($val[0] === "'" && $val[$len - 1] === "'"))) {
            $val = substr($val, 1, -1);
        }
        if ($key !== '') {
            $out[$key] = $val;
        }
    }
    return $out;
}

/**
 * Load and validate notification config.
 *
 * @return array{ok:bool,cfg:array<string,string>,detail:string}
 */
function m365_load_config(string $docRoot): array
{
    foreach (m365_config_paths($docRoot) as $path) {
        if (!is_readable($path)) {
            continue;
        }
        $raw = @file_get_contents($path);
        if ($raw === false) {
            continue;
        }
        $cfg = m365_parse_env($raw);
        $missing = [];
        foreach (M365_REQUIRED_KEYS as $k) {
            if (($cfg[$k] ?? '') === '') {
                $missing[] = $k;
            }
        }
        if ($missing) {
            // Names only. A value is never echoed, logged, or returned.
            return ['ok' => false, 'cfg' => [], 'detail' => 'CONFIG_INCOMPLETE:' . implode('/', $missing)];
        }
        return ['ok' => true, 'cfg' => $cfg, 'detail' => 'CONFIG_OK'];
    }
    return ['ok' => false, 'cfg' => [], 'detail' => 'CONFIG_MISSING'];
}

/**
 * Client-credentials token for Microsoft Graph.
 *
 * @param array<string,string> $cfg
 * @return array{ok:bool,token:string,detail:string}
 */
function m365_token(array $cfg): array
{
    $url = 'https://login.microsoftonline.com/'
         . rawurlencode($cfg['AZURE_TENANT_ID']) . '/oauth2/v2.0/token';

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => M365_CONNECT_TIMEOUT,
        CURLOPT_TIMEOUT        => M365_TOTAL_TIMEOUT,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_POSTFIELDS     => http_build_query([
            'client_id'     => $cfg['AZURE_CLIENT_ID'],
            'client_secret' => $cfg['AZURE_CLIENT_SECRET'],
            'scope'         => 'https://graph.microsoft.com/.default',
            'grant_type'    => 'client_credentials',
        ]),
    ]);
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $cerr = curl_error($ch);

    if ($body === false) {
        return ['ok' => false, 'token' => '', 'detail' => 'TOKEN_TRANSPORT:' . $cerr];
    }
    $json = json_decode((string) $body, true);
    if (!is_array($json)) {
        return ['ok' => false, 'token' => '', 'detail' => 'TOKEN_BAD_JSON:' . $code];
    }
    if ($code !== 200 || !isset($json['access_token']) || !is_string($json['access_token'])) {
        // Azure's `error` code is safe to log; `error_description` can echo
        // request detail, so only the short code is kept.
        $err = is_string($json['error'] ?? null) ? $json['error'] : 'unknown';
        return ['ok' => false, 'token' => '', 'detail' => 'TOKEN_DENIED:' . $code . ':' . $err];
    }
    return ['ok' => true, 'token' => $json['access_token'], 'detail' => 'TOKEN_OK'];
}

/**
 * Send one notification via Graph sendMail.
 *
 * VISIBLE SENDER — MEASURED BEHAVIOUR, NOT AN ASSUMPTION
 * ------------------------------------------------------
 * We request `from` = the AmbiSecure alias, but Exchange Online REWRITES it to
 * the mailbox's primary SMTP address on delivery. Measured 2026-08-21 against
 * the live tenant, all three variants produced the same received header:
 *
 *   requested  AmbiSecure Online Inquiry <ambisecure@ambimat.com>
 *   received   Hemang Shah <business.development@ambimat.com>
 *
 *   1. JSON `from`                                    -> rewritten
 *   2. JSON `from`, retried after propagation         -> rewritten
 *   3. raw RFC822 MIME upload with its own From header -> rewritten
 *
 * This is true even with `SendFromAliasEnabled = True` (that setting serves
 * Outlook/OWA clients, not server-side Graph submission) and even after
 * granting the app explicit SendAs on the mailbox, which changed nothing and
 * was therefore revoked.
 *
 * The only transport that could preserve the alias is OAuth SMTP, and Exchange
 * refuses SMTP submission for an app unless it holds FullAccess on the entire
 * mailbox — strictly broader than the Mail.Read this design forbids. Trading
 * full read/write over the business-development mailbox for a cosmetic From on
 * an internal self-notification is a bad bargain, so it was declined. Accepted
 * by the operator on 2026-08-21.
 *
 * The `from` field below is kept deliberately: it is the correct request, it
 * costs nothing, and if Microsoft ever honours aliases for Graph submission the
 * intended sender appears with no code change.
 *
 * The AmbiSecure identity therefore travels in the SUBJECT
 * ("AmbiSecure enquiry [purpose] <ref>"), which is what the receiving mailbox
 * filters and searches on.
 *
 * The customer's address is used ONLY as Reply-To. It is never the From, the
 * Sender, or the envelope sender — doing that would forge a third-party domain
 * and fail their SPF/DMARC.
 *
 * @param array<string,string> $cfg
 * @return array{ok:bool,detail:string}
 */
function m365_send_mail(
    array $cfg,
    string $token,
    string $subject,
    string $body,
    string $replyTo,
    string $ref
): array {
    $message = [
        'subject' => $subject,
        'body'    => ['contentType' => 'Text', 'content' => $body],
        'from'    => ['emailAddress' => [
            'address' => $cfg['MAIL_FROM_ALIAS'],
            'name'    => $cfg['MAIL_FROM_NAME'] ?? 'AmbiSecure Online Inquiry',
        ]],
        'toRecipients' => [
            ['emailAddress' => ['address' => $cfg['MAIL_NOTIFY_TO']]],
        ],
        'internetMessageHeaders' => [
            ['name' => 'X-AmbiSecure-Ref', 'value' => $ref],
        ],
    ];
    if ($replyTo !== '') {
        $message['replyTo'] = [['emailAddress' => ['address' => $replyTo]]];
    }

    $payload = json_encode(
        ['message' => $message, 'saveToSentItems' => true],
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );
    if ($payload === false) {
        return ['ok' => false, 'detail' => 'SEND_ENCODE_FAILED'];
    }

    $url = 'https://graph.microsoft.com/v1.0/users/'
         . rawurlencode($cfg['MAIL_SEND_AS']) . '/sendMail';

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => M365_CONNECT_TIMEOUT,
        CURLOPT_TIMEOUT        => M365_TOTAL_TIMEOUT,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json; charset=utf-8',
        ],
        CURLOPT_POSTFIELDS     => $payload,
    ]);
    $resp = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $cerr = curl_error($ch);

    if ($resp === false) {
        return ['ok' => false, 'detail' => 'SEND_TRANSPORT:' . $cerr];
    }
    if ($code === 202) {
        // 202 means Graph accepted it for delivery, NOT that it arrived.
        return ['ok' => true, 'detail' => 'SEND_ACCEPTED:202'];
    }
    $json = json_decode((string) $resp, true);
    $err  = 'unknown';
    if (is_array($json) && is_string($json['error']['code'] ?? null)) {
        $err = $json['error']['code'];
    }
    return ['ok' => false, 'detail' => 'SEND_REJECTED:' . $code . ':' . $err];
}

/**
 * Full notification attempt. Never throws; the caller's lead is already stored
 * and must not be affected by anything that happens in here.
 *
 * @return array{ok:bool,detail:string}
 */
function m365_notify(
    string $docRoot,
    string $subject,
    string $body,
    string $replyTo,
    string $ref
): array {
    try {
        $conf = m365_load_config($docRoot);
        if (!$conf['ok']) {
            return ['ok' => false, 'detail' => $conf['detail']];
        }
        $tok = m365_token($conf['cfg']);
        if (!$tok['ok']) {
            return ['ok' => false, 'detail' => $tok['detail']];
        }
        return m365_send_mail($conf['cfg'], $tok['token'], $subject, $body, $replyTo, $ref);
    } catch (\Throwable $e) {
        return ['ok' => false, 'detail' => 'SEND_EXCEPTION'];
    }
}
