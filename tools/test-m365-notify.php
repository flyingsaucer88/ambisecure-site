<?php
/**
 * Offline unit checks for the Microsoft Graph notification transport.
 *
 * Covers the logic that decides WHETHER to send and WHAT is considered a
 * failure. It deliberately makes no network call: the live send is proven
 * separately against the real tenant, and CI must not depend on Microsoft
 * being reachable.
 *
 *   php tools/test-m365-notify.php     # exit 0 = pass
 */

declare(strict_types=1);

require __DIR__ . '/../contact/notify.php';

$pass = 0;
$fail = 0;

function check(string $label, bool $ok): void
{
    global $pass, $fail;
    if ($ok) { $pass++; printf("  PASS  %s\n", $label); }
    else     { $fail++; printf("  FAIL  %s\n", $label); }
}

// --- env parsing -----------------------------------------------------------

$cfg = m365_parse_env(
    "# a comment\n"
  . "AZURE_TENANT_ID=tenant-123\n"
  . "\n"
  . "AZURE_CLIENT_SECRET=has=equals=signs\n"
  . "QUOTED=\"quoted-value\"\n"
  . "SINGLE='single-value'\n"
  . "  SPACED  =  spaced-value  \n"
  . "novalue\n"
);
check('comment and blank lines ignored',        !isset($cfg['# a comment']));
check('plain key read',                          ($cfg['AZURE_TENANT_ID'] ?? '') === 'tenant-123');
// A client secret can legitimately contain '=' — splitting on the LAST '=' or
// on every '=' would silently truncate it and cause an unexplained auth failure.
check('value keeps embedded = signs',            ($cfg['AZURE_CLIENT_SECRET'] ?? '') === 'has=equals=signs');
check('double quotes stripped',                  ($cfg['QUOTED'] ?? '') === 'quoted-value');
check('single quotes stripped',                  ($cfg['SINGLE'] ?? '') === 'single-value');
check('surrounding whitespace trimmed',          ($cfg['SPACED'] ?? '') === 'spaced-value');
check('line without = skipped',                  !array_key_exists('novalue', $cfg));

// CRLF files (uploaded from Windows) must parse identically.
$crlf = m365_parse_env("A=1\r\nB=2\r\n");
check('CRLF line endings handled',               ($crlf['A'] ?? '') === '1' && ($crlf['B'] ?? '') === '2');

// --- config location -------------------------------------------------------

$paths = m365_config_paths('/srv/site/public_html');
check('credential path sits ABOVE the web root',
    in_array('/srv/site/.ambisecure-mail.env', $paths, true));
check('no candidate path is inside the web root',
    count(array_filter($paths, fn($p) => str_starts_with($p, '/srv/site/public_html'))) === 0);

// --- fail-closed behaviour -------------------------------------------------

$tmp = sys_get_temp_dir() . '/as-notify-test-' . bin2hex(random_bytes(4));
mkdir($tmp . '/public_html', 0700, true);

// No credential file anywhere.
putenv('AMBISECURE_MAIL_CONFIG=' . $tmp . '/does-not-exist.env');
$r = m365_load_config($tmp . '/public_html');
check('missing credential file reports CONFIG_MISSING', !$r['ok'] && $r['detail'] === 'CONFIG_MISSING');

// Present but incomplete — must NOT attempt a send with half a credential.
$partial = $tmp . '/partial.env';
file_put_contents($partial, "AZURE_TENANT_ID=t\nAZURE_CLIENT_ID=c\n");
putenv('AMBISECURE_MAIL_CONFIG=' . $partial);
$r = m365_load_config($tmp . '/public_html');
check('incomplete credential rejected',          !$r['ok'] && str_starts_with($r['detail'], 'CONFIG_INCOMPLETE:'));
check('missing key NAMES reported for diagnosis', str_contains($r['detail'], 'AZURE_CLIENT_SECRET'));

// An empty value must count as missing, not as a valid empty secret.
$empty = $tmp . '/empty.env';
file_put_contents($empty,
    "AZURE_TENANT_ID=t\nAZURE_CLIENT_ID=c\nAZURE_CLIENT_SECRET=\n"
  . "MAIL_SEND_AS=a@b.com\nMAIL_FROM_ALIAS=c@d.com\nMAIL_NOTIFY_TO=e@f.com\n");
putenv('AMBISECURE_MAIL_CONFIG=' . $empty);
$r = m365_load_config($tmp . '/public_html');
check('empty secret treated as missing',         !$r['ok'] && str_contains($r['detail'], 'AZURE_CLIENT_SECRET'));

// A complete file loads.
$good = $tmp . '/good.env';
file_put_contents($good,
    "AZURE_TENANT_ID=t\nAZURE_CLIENT_ID=c\nAZURE_CLIENT_SECRET=s\n"
  . "MAIL_SEND_AS=a@b.com\nMAIL_FROM_ALIAS=c@d.com\nMAIL_NOTIFY_TO=e@f.com\n");
putenv('AMBISECURE_MAIL_CONFIG=' . $good);
$r = m365_load_config($tmp . '/public_html');
check('complete credential accepted',            $r['ok'] && $r['detail'] === 'CONFIG_OK');

// The whole notify path must return a failure, never throw, when unconfigured.
putenv('AMBISECURE_MAIL_CONFIG=' . $tmp . '/does-not-exist.env');
$n = m365_notify($tmp . '/public_html', 'subject', 'body', 'customer@example.com', 'AS-TEST');
check('notify returns failure instead of throwing', $n['ok'] === false);

// --- no secret may leak into a status string ------------------------------
//
// The detail string is written to the operational log on every enquiry, so a
// secret appearing there would persist it in plaintext. Plant a distinctive
// canary as the secret and assert it never surfaces in any returned status.
$canary = 'CANARY-' . bin2hex(random_bytes(8));
$leaky  = $tmp . '/leaky.env';
file_put_contents($leaky,
    "AZURE_TENANT_ID=t\nAZURE_CLIENT_ID=c\nAZURE_CLIENT_SECRET={$canary}\n"
  . "MAIL_SEND_AS=a@b.com\nMAIL_FROM_ALIAS=c@d.com\nMAIL_NOTIFY_TO=e@f.com\n");
putenv('AMBISECURE_MAIL_CONFIG=' . $leaky);

$r = m365_load_config($tmp . '/public_html');
check('config loads with canary secret',            $r['ok']);
check('secret value is never in the detail string', !str_contains($r['detail'], $canary));
check('secret value IS available to the caller',    ($r['cfg']['AZURE_CLIENT_SECRET'] ?? '') === $canary);

// Incomplete-config diagnostics report key NAMES only, never any value.
$mixed = $tmp . '/mixed.env';
file_put_contents($mixed, "AZURE_TENANT_ID=t\nAZURE_CLIENT_SECRET={$canary}\n");
putenv('AMBISECURE_MAIL_CONFIG=' . $mixed);
$r = m365_load_config($tmp . '/public_html');
check('incomplete-config detail names keys only',   !$r['ok'] && !str_contains($r['detail'], $canary));

array_map('unlink', glob($tmp . '/*.env') ?: []);
rmdir($tmp . '/public_html');
rmdir($tmp);
putenv('AMBISECURE_MAIL_CONFIG');

printf("\n  transport: passed=%d failed=%d\n", $pass, $fail);
exit($fail === 0 ? 0 : 1);
