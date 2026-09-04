<?php
/**
 * AmbiSecure contact endpoint — first-party, no third-party processor.
 *
 * WHY THIS EXISTS
 * ---------------
 * The previous form was `action="mailto:"`, which hands off to the visitor's
 * desktop mail client. Webmail and mobile users hit a dead end and nothing was
 * ever recorded server-side, so lost enquiries were invisible. This endpoint
 * replaces that with a durable first-party capture.
 *
 * SUCCESS SEMANTICS (deliberate)
 * ------------------------------
 * An enquiry is "accepted" when it has been durably appended to the lead store.
 * Email notification is best-effort on top of that. Treating delivery as the
 * success condition would reintroduce exactly the silent-loss failure we are
 * fixing: the visitor would be told their enquiry failed when we already hold
 * it. The lead store is the authoritative record.
 *
 * NOTIFICATION TRANSPORT
 * ----------------------
 * PHP mail() is gone. It returned false on this host — there is no local MTA,
 * so no message was ever emitted (production evidence: a run of
 * `LEAD_CAPTURED MAIL_FAILED` lines). That is a missing transport, not an SPF
 * failure; nothing was ever sent for SPF to evaluate, and no DNS record was
 * changed. Notification now goes out over authenticated Microsoft Graph —
 * see contact/notify.php.
 *
 * The lead store lives at /.leads/ — a dotdir, already returned 403 by the
 * existing .htaccess rule `RewriteCond %{REQUEST_URI} ^/\.(?!well-known/)`.
 * FTP deploys are additive-only, so it survives releases.
 *
 * No secret is stored in this file, in the repo, or anywhere under the web
 * root. Credentials are read at runtime from outside public_html.
 */

declare(strict_types=1);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Notification recipient and sending identity now live in the credential file
 * read by contact/notify.php, which is stored outside the web root. Nothing
 * sender-related is configured here any more, and no secret is in this file.
 */
require_once __DIR__ . '/notify.php';

const MAX_BODY_BYTES   = 65536;   // 64 KB
const MAX_NAME         = 120;
const MAX_COMPANY      = 160;
const MAX_EMAIL        = 254;     // RFC 5321
const MAX_PHONE        = 40;
const MAX_COUNTRY      = 60;
const MAX_MESSAGE      = 8000;
const MIN_MESSAGE      = 10;
const MAX_DETAILS      = 4096;    // typed `details` JSON, before decoding
const MAX_DETAIL_KEYS  = 24;
const MAX_DETAIL_VALUE = 400;
const RATE_MAX         = 5;       // submissions ...
const RATE_WINDOW_SECS = 3600;    // ... per hour, per IP hash
const MIN_FILL_SECONDS = 3;       // humans take longer than this

/** Allow-listed enquiry purposes. Anything else becomes 'general'. */
const PURPOSES = [
    'general'          => 'General enquiry',
    'javacard'         => 'JavaCard applet engagement',
    'secure-element'   => 'Secure element integration',
    'fido-server'      => 'FIDO Validation Server',
    'oem-authenticator'=> 'OEM / white-label authenticators',
    'iot-device-trust' => 'IoT device identity',
    'secure-ota'       => 'Secure OTA / firmware update',
    'product-quote'    => 'Product enquiry / quote',
    'pilot'            => 'Pilot batch (cards / keys)',
    'partnership'      => 'Partnership',
    'press'            => 'Press / media',
    'support'          => 'Support',
];

/** Allow-listed error codes surfaced back to /contact/?err=... */
const ERRORS = [
    'method', 'origin', 'toolarge', 'validation', 'ratelimit', 'server',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function wants_json(): bool
{
    $a = $_SERVER['HTTP_ACCEPT'] ?? '';
    $x = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
    return stripos($a, 'application/json') !== false || $x === 'fetch';
}

/**
 * Strip anything that could break out of a mail header, plus control chars.
 * Applied to every value that reaches a header AND to values written to the
 * log, so a payload cannot forge log lines either.
 */
function scrub(string $v): string
{
    $v = str_replace(["\r", "\n", "\0"], ' ', $v);
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    // Reject malformed UTF-8 rather than letting it corrupt mail or JSON.
    if (!mb_check_encoding($v, 'UTF-8')) {
        $v = mb_convert_encoding($v, 'UTF-8', 'UTF-8');
    }
    return trim($v);
}

/** Same as scrub() but keeps newlines — for the message body only. */
function scrub_multiline(string $v): string
{
    $v = str_replace(["\r\n", "\r", "\0"], ["\n", "\n", ''], $v);
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    if (!mb_check_encoding($v, 'UTF-8')) {
        $v = mb_convert_encoding($v, 'UTF-8', 'UTF-8');
    }
    return trim($v);
}

function field(string $k): string
{
    $v = $_POST[$k] ?? '';
    return is_string($v) ? $v : '';
}

/** Non-guessable reference, not derived from any submitted value. */
/**
 * The typed `details` map from the Central Intake schema (runbook v1.5 SS29.4).
 *
 * This endpoint predates the typed layer and must not start trusting it now:
 * `details` is whatever a caller posted. It is accepted only as a FLAT map of
 * short scalars or short string lists, and anything else is discarded rather
 * than stored — an unbounded or nested structure written into a JSONL lead
 * store is a way to make the store unreadable, not a feature.
 *
 * Nothing here is authoritative. The Central Intake Lambda validates `details`
 * against the closed JSON Schema for the site's schemaId; this is a transitional
 * store so the answers a visitor gave are not thrown away before that exists.
 */
function details_map(): array
{
    $raw = field('details');
    if ($raw === '' || strlen($raw) > MAX_DETAILS) {
        return [];
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return [];
    }
    $out = [];
    foreach ($decoded as $k => $v) {
        if (count($out) >= MAX_DETAIL_KEYS) {
            break;
        }
        if (!is_string($k) || !preg_match('/^[A-Za-z][A-Za-z0-9_]{0,39}$/', $k)) {
            continue;
        }
        if (is_int($v) || is_float($v)) {
            // Kept numeric so a quantity stays sortable in the store.
            $out[$k] = $v;
        } elseif (is_string($v)) {
            $sv = scrub($v);
            if ($sv !== '' && mb_strlen($sv) <= MAX_DETAIL_VALUE) {
                $out[$k] = $sv;
            }
        } elseif (is_array($v) && array_keys($v) === range(0, count($v) - 1)) {
            // A LIST only. A nested object is also is_array() in PHP, and
            // flattening one would silently reshape the data into something the
            // schema never described.
            $list = [];
            foreach ($v as $item) {
                if (!is_string($item) && !is_int($item)) {
                    continue;
                }
                $si = scrub((string) $item);
                if ($si !== '' && mb_strlen($si) <= MAX_DETAIL_VALUE && count($list) < MAX_DETAIL_KEYS) {
                    $list[] = $si;
                }
            }
            if ($list) {
                $out[$k] = $list;
            }
        }
    }
    return $out;
}

function make_ref(): string
{
    return 'AS-' . gmdate('Ymd') . '-' . strtoupper(bin2hex(random_bytes(4)));
}

/** Per-day salted IP hash — enough for rate limiting, not a stored identifier. */
function client_key(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    return hash('sha256', $ip . '|' . gmdate('Y-m-d'));
}

function leads_dir(): string
{
    return dirname(__DIR__) . '/.leads';
}

function respond_error(string $code, array $fields = []): void
{
    $code = in_array($code, ERRORS, true) ? $code : 'server';
    $status = match ($code) {
        'method'     => 405,
        'origin'     => 403,
        'toolarge'   => 413,
        'ratelimit'  => 429,
        'validation' => 422,
        default      => 500,
    };
    if (wants_json()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => $code, 'fields' => $fields]);
        return;
    }
    http_response_code(303);
    $q = 'err=' . rawurlencode($code);
    if ($fields) {
        $q .= '&f=' . rawurlencode(implode(',', array_slice($fields, 0, 8)));
    }
    // Fixed first-party destination. No externally controlled redirect target.
    header('Location: /contact/?' . $q . '#contact-form');
}

function respond_ok(string $ref, string $purpose): void
{
    if (wants_json()) {
        http_response_code(200);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => true, 'ref' => $ref, 'purpose' => $purpose]);
        return;
    }
    http_response_code(303);
    header('Location: /contact/thank-you/?ref=' . rawurlencode($ref)
        . '&purpose=' . rawurlencode($purpose));
}

// ---------------------------------------------------------------------------
// Request gating
// ---------------------------------------------------------------------------

header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Cache-Control: no-store');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond_error('method');
    exit;
}

// Same-origin enforcement (CSRF). The form is same-origin and CSP already
// declares `form-action 'self'`; this is the server-side half of that.
$originish = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
if ($originish === '') {
    respond_error('origin');   // no Origin and no Referer — not our form
    exit;
}
// HTTP_HOST carries the port ("example.com:8080") but parse_url()'s host does
// not, so strip the port from both sides before comparing or the check fails
// on any non-default port.
$host  = strtok((string) ($_SERVER['HTTP_HOST'] ?? ''), ':');
$oHost = parse_url($originish, PHP_URL_HOST) ?? '';
if ($host === false || $host === '' || $oHost === ''
    || strcasecmp($oHost, (string) $host) !== 0) {
    respond_error('origin');
    exit;
}

$ctype = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($ctype, 'application/x-www-form-urlencoded') === false
    && stripos($ctype, 'multipart/form-data') === false) {
    respond_error('validation', ['_form']);
    exit;
}

$len = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($len > MAX_BODY_BYTES) {
    respond_error('toolarge', ['message']);
    exit;
}

// Honeypot — a real browser leaves this empty; bots fill every input.
if (scrub(field('website')) !== '') {
    // Accept-and-discard: telling a bot it failed just teaches it.
    respond_ok(make_ref(), 'general');
    exit;
}

// Timing check. `ts` is set by JS on page load; absent when JS is off, in
// which case we skip rather than punish no-JS users.
$ts = field('ts');
if ($ts !== '' && ctype_digit($ts)) {
    if ((time() - (int) $ts) < MIN_FILL_SECONDS) {
        respond_ok(make_ref(), 'general');   // same accept-and-discard
        exit;
    }
}

// ---------------------------------------------------------------------------
// Rate limiting (file-based, privacy-conscious: salted hash, no raw IP stored)
// ---------------------------------------------------------------------------

$rateFile = sys_get_temp_dir() . '/as-rate-' . client_key() . '.txt';
$hits = [];
if (is_readable($rateFile)) {
    $raw = (string) file_get_contents($rateFile);
    foreach (explode(',', $raw) as $t) {
        if (ctype_digit(trim($t)) && (time() - (int) $t) < RATE_WINDOW_SECS) {
            $hits[] = (int) trim($t);
        }
    }
}
if (count($hits) >= RATE_MAX) {
    respond_error('ratelimit');
    exit;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

$name    = scrub(field('name'));
$company = scrub(field('company'));
$email   = scrub(field('email'));
$phone   = scrub(field('phone'));
$country = scrub(field('country'));
$message = scrub_multiline(field('message'));
$purpose = scrub(field('purpose'));
$details = details_map();
// The client renders the labels because only the client has them; this is for
// the notification email and is never the authoritative copy.
$detailsText = scrub_multiline(field('detailsText'));
if (mb_strlen($detailsText) > MAX_DETAILS) {
    $detailsText = '';
}

if (!array_key_exists($purpose, PURPOSES)) {
    $purpose = 'general';
}

$bad = [];
if ($name === '' || mb_strlen($name) > MAX_NAME) {
    $bad[] = 'name';
}
if ($company !== '' && mb_strlen($company) > MAX_COMPANY) {
    $bad[] = 'company';
}
if ($email === ''
    || mb_strlen($email) > MAX_EMAIL
    || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $bad[] = 'email';
}
if ($phone !== '' && mb_strlen($phone) > MAX_PHONE) {
    $bad[] = 'phone';
}
if ($country !== '' && mb_strlen($country) > MAX_COUNTRY) {
    $bad[] = 'country';
}
if (mb_strlen($message) < MIN_MESSAGE || mb_strlen($message) > MAX_MESSAGE) {
    $bad[] = 'message';
}

if ($bad) {
    respond_error('validation', $bad);
    exit;
}

// ---------------------------------------------------------------------------
// Durable capture — this is what "accepted" means
// ---------------------------------------------------------------------------

$ref = make_ref();
$now = gmdate('c');
$dir = leads_dir();

if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
    respond_error('server');
    exit;
}
// Belt-and-braces: the dotdir is already 403 via .htaccess, but if that file
// is ever lost this keeps the store unreadable over HTTP.
$guard = $dir . '/.htaccess';
if (!file_exists($guard)) {
    @file_put_contents($guard, "Require all denied\nDeny from all\n");
}

$record = [
    'ref'       => $ref,
    'ts'        => $now,
    'purpose'   => $purpose,
    'name'      => $name,
    'company'   => $company,
    'email'     => $email,
    'phone'     => $phone,
    'country'   => $country,
    'message'   => $message,
    'source'    => scrub((string) (parse_url((string) $originish, PHP_URL_PATH) ?? '')),
];
// Omitted entirely when the form collected nothing typed, so an older record and
// a schema-aware one stay distinguishable in the store.
if ($details) {
    $record['schemaId'] = scrub(field('schemaId'));
    $record['details']  = $details;
}

$line = json_encode($record, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if ($line === false) {
    respond_error('server');
    exit;
}

$store = $dir . '/' . gmdate('Y-m') . '.jsonl';
$written = @file_put_contents($store, $line . "\n", FILE_APPEND | LOCK_EX);
if ($written === false) {
    // Nothing durable happened — do NOT report success.
    respond_error('server');
    exit;
}
@chmod($store, 0600);

// Rate-limit state only advances on a genuinely accepted enquiry.
$hits[] = time();
@file_put_contents($rateFile, implode(',', $hits), LOCK_EX);

// ---------------------------------------------------------------------------
// Notification (best-effort — never changes the success outcome)
// ---------------------------------------------------------------------------

$label   = PURPOSES[$purpose];
$subject = 'AmbiSecure enquiry [' . $purpose . '] ' . $ref;

$body = "New AmbiSecure enquiry\n"
      . "======================\n\n"
      . 'Reference:      ' . $ref . "\n"
      . 'Received (UTC): ' . $now . "\n"
      . 'Purpose:        ' . $label . ' (' . $purpose . ")\n\n"
      . 'Name:           ' . $name . "\n"
      . 'Company:        ' . ($company !== '' ? $company : '—') . "\n"
      . 'Email:          ' . $email . "\n"
      . 'Phone:          ' . ($phone !== '' ? $phone : '—') . "\n"
      . 'Country:        ' . ($country !== '' ? $country : '—') . "\n\n"
      . ($detailsText !== '' ? "Enquiry details:\n----------------\n" . $detailsText . "\n\n" : '')
      . "Message:\n--------\n" . $message . "\n\n"
      . "--\nCaptured by contact/submit.php. Authoritative copy is in\n"
      . "/.leads/" . gmdate('Y-m') . ".jsonl on the web host.\n";

// Every value below is scrubbed of CR/LF above, so header injection via
// name/email/purpose is not possible. The customer's address is passed ONLY as
// Reply-To — never as From, Sender, or envelope sender, which would forge their
// domain and fail their SPF/DMARC.
//
// dirname(__DIR__) is the deployed web root (public_html); notify.php looks one
// level above it for the credential file, which is unreachable over HTTP.
$notify   = m365_notify(dirname(__DIR__), $subject, $body, $email, $ref);
$mailOk   = $notify['ok'];
$mailWhy  = $notify['detail'];

// ---------------------------------------------------------------------------
// Operational status line — no PII
// ---------------------------------------------------------------------------
//
// One line per enquiry, recording capture and notification separately. This is
// how an operator answers "did we get the lead?" and "did the email go out?"
// without opening the store or depending on analytics consent.
//
// LEAD_CAPTURED is unconditional here: we only reach this point after the
// durable write succeeded, so capture is already guaranteed. MAIL_SENT means
// Microsoft Graph accepted the message (HTTP 202) — it does NOT prove inbox
// delivery, which only the receiving mailbox can confirm.
//
// The short reason code is appended so an operator can tell a missing
// credential file (CONFIG_MISSING) from a rejected credential (TOKEN_DENIED)
// from a network problem (SEND_TRANSPORT) without reading the lead store.
// These codes never contain a secret, a token, or any customer data.
$status = 'LEAD_CAPTURED ' . ($mailOk ? 'MAIL_SENT' : 'MAIL_FAILED ' . $mailWhy);
@file_put_contents(
    $dir . '/count-' . gmdate('Y-m') . '.log',
    $now . ' ' . $ref . ' ' . $purpose . ' ' . $status . "\n",
    FILE_APPEND | LOCK_EX
);

// Mail outcome deliberately does not affect the response: the enquiry is
// already safely stored, and telling the visitor it failed would be false.
respond_ok($ref, $purpose);
