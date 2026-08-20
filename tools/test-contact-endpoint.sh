#!/usr/bin/env bash
# Focused tests for contact/submit.php.
#
# Spins up PHP's built-in server against a throwaway docroot copy, exercises
# the endpoint, and asserts on status codes / JSON. No network, no mail, no
# writes into the real repo tree.
#
#   bash tools/test-contact-endpoint.sh
#
# Exit 0 = all pass, 1 = a case failed.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-8767}"
BASE="http://127.0.0.1:${PORT}"
WORK="$(mktemp -d)"
PASS=0; FAIL=0

cleanup() {
  [[ -n "${SRV_PID:-}" ]] && kill "$SRV_PID" 2>/dev/null
  rm -rf "$WORK"
}
trap cleanup EXIT

# Isolated docroot: only what the endpoint needs.
# Rate-limit state lives in the system temp dir keyed by IP+date, so it
# survives between runs. Clear it or the suite is not repeatable.
rm -f "$(php -r 'echo sys_get_temp_dir();')"/as-rate-*.txt

mkdir -p "$WORK/contact"
cp "$ROOT/contact/submit.php" "$WORK/contact/submit.php"

php -S "127.0.0.1:${PORT}" -t "$WORK" >/dev/null 2>&1 &
SRV_PID=$!
for _ in $(seq 1 40); do
  curl -s -o /dev/null "$BASE/contact/submit.php" && break
  sleep 0.1
done

# post <name> <expected-status> <expect-substring|-> <curl args...>
post() {
  local label="$1" want="$2" expect="$3"; shift 3
  local out code
  out=$(curl -s -o "$WORK/body" -w '%{http_code}' \
        -H "Origin: $BASE" -H 'Accept: application/json' \
        -X POST "$@" "$BASE/contact/submit.php")
  code="$out"
  local body; body="$(cat "$WORK/body")"
  local ok=1
  [[ "$code" == "$want" ]] || ok=0
  if [[ "$expect" != "-" ]] && ! grep -q "$expect" <<<"$body"; then ok=0; fi
  if [[ $ok -eq 1 ]]; then
    PASS=$((PASS+1)); printf '  PASS  %-38s [%s]\n' "$label" "$code"
  else
    FAIL=$((FAIL+1)); printf '  FAIL  %-38s got=%s want=%s body=%s\n' \
      "$label" "$code" "$want" "${body:0:160}"
  fi
}

VALID=(-d 'name=Test Engineer' -d 'company=Acme Embedded'
       -d 'email=test@example.com' -d 'purpose=javacard'
       -d 'message=We need a JavaCard applet built for a PIV-like use case.')

echo "== contact endpoint tests =="

post "valid submission"            200 '"ok":true'        "${VALID[@]}"
post "invalid email"               422 '"error":"validation"' \
     -d 'name=X' -d 'email=not-an-email' -d 'message=A message long enough here.'
post "missing required name"       422 '"error":"validation"' \
     -d 'email=a@b.com' -d 'message=A message long enough to pass.'
post "missing required message"    422 '"error":"validation"' \
     -d 'name=X' -d 'email=a@b.com'
post "message too short"           422 '"error":"validation"' \
     -d 'name=X' -d 'email=a@b.com' -d 'message=hi'
post "honeypot filled (accept+discard)" 200 '"ok":true' \
     -d 'name=Bot' -d 'email=bot@spam.test' -d 'website=http://spam' \
     -d 'message=Buy cheap things right now please.'
post "header injection in name"    200 '"ok":true' \
     -d $'name=A\r\nBcc: victim@evil.test' -d 'email=a@b.com' \
     -d 'message=Trying a header injection payload here.'
post "xss payload in message"      200 '"ok":true' \
     -d 'name=X' -d 'email=a@b.com' \
     -d 'message=<script>alert(1)</script> and more text to pass length.'
post "unknown purpose coerced"     200 '"purpose":"general"' \
     -d 'name=X' -d 'email=a@b.com' -d 'purpose=../../etc/passwd' \
     -d 'message=Checking that purpose is allow-listed properly.'

# GET must not be accepted
code=$(curl -s -o /dev/null -w '%{http_code}' -H 'Accept: application/json' "$BASE/contact/submit.php")
if [[ "$code" == "405" ]]; then PASS=$((PASS+1)); printf '  PASS  %-38s [405]\n' "GET rejected"
else FAIL=$((FAIL+1)); printf '  FAIL  %-38s got=%s want=405\n' "GET rejected" "$code"; fi

# Cross-origin must be refused
code=$(curl -s -o /dev/null -w '%{http_code}' -H 'Origin: https://evil.test' \
       -H 'Accept: application/json' -X POST "${VALID[@]}" "$BASE/contact/submit.php")
if [[ "$code" == "403" ]]; then PASS=$((PASS+1)); printf '  PASS  %-38s [403]\n' "cross-origin rejected"
else FAIL=$((FAIL+1)); printf '  FAIL  %-38s got=%s want=403\n' "cross-origin rejected" "$code"; fi

# Missing Origin AND Referer must be refused
code=$(curl -s -o /dev/null -w '%{http_code}' -H 'Accept: application/json' \
       -X POST "${VALID[@]}" "$BASE/contact/submit.php")
if [[ "$code" == "403" ]]; then PASS=$((PASS+1)); printf '  PASS  %-38s [403]\n' "no origin/referer rejected"
else FAIL=$((FAIL+1)); printf '  FAIL  %-38s got=%s want=403\n' "no origin/referer rejected" "$code"; fi

# Oversized message
BIG=$(head -c 9000 /dev/zero | tr '\0' 'a')
post "oversized message"           422 '"error":"validation"' \
     -d 'name=X' -d 'email=a@b.com' --data-urlencode "message=$BIG"

# No-JS path: without Accept: application/json we expect a 303 to thank-you
loc=$(curl -s -o /dev/null -w '%{redirect_url}' -H "Origin: $BASE" \
      -X POST "${VALID[@]}" "$BASE/contact/submit.php")
if [[ "$loc" == *"/contact/thank-you/?ref=AS-"* ]]; then
  PASS=$((PASS+1)); printf '  PASS  %-38s\n' "no-JS 303 -> thank-you"
else
  FAIL=$((FAIL+1)); printf '  FAIL  %-38s loc=%s\n' "no-JS 303 -> thank-you" "$loc"
fi

# Validation failure on the no-JS path returns to the form, not a dead end.
# Rate limiting is checked before validation (cheaper, and it blunts
# brute-forcing), so clear the allowance to test validation in isolation.
rm -f "$(php -r 'echo sys_get_temp_dir();')"/as-rate-*.txt
loc=$(curl -s -o /dev/null -w '%{redirect_url}' -H "Origin: $BASE" \
      -X POST -d 'name=X' -d 'email=bad' -d 'message=short' "$BASE/contact/submit.php")
if [[ "$loc" == *"/contact/?err=validation"* ]]; then
  PASS=$((PASS+1)); printf '  PASS  %-38s\n' "no-JS error -> /contact/?err="
else
  FAIL=$((FAIL+1)); printf '  FAIL  %-38s loc=%s\n' "no-JS error -> /contact/?err=" "$loc"
fi

# Rate limit: the successful posts above already consumed the allowance.
RL=0
for i in $(seq 1 8); do
  code=$(curl -s -o /dev/null -w '%{http_code}' -H "Origin: $BASE" \
         -H 'Accept: application/json' -X POST "${VALID[@]}" "$BASE/contact/submit.php")
  [[ "$code" == "429" ]] && RL=1 && break
done
if [[ $RL -eq 1 ]]; then PASS=$((PASS+1)); printf '  PASS  %-38s [429]\n' "rate limiting engages"
else FAIL=$((FAIL+1)); printf '  FAIL  %-38s never returned 429\n' "rate limiting engages"; fi

# Durable store: confirm accepted enquiries were actually written, and that
# the injection payloads were neutralised on the way in.
STORE="$WORK/.leads/$(date -u +%Y-%m).jsonl"
if [[ -s "$STORE" ]]; then
  PASS=$((PASS+1)); printf '  PASS  %-38s (%s lines)\n' "durable lead store written" "$(wc -l <"$STORE" | tr -d ' ')"
else
  FAIL=$((FAIL+1)); printf '  FAIL  %-38s missing/empty: %s\n' "durable lead store written" "$STORE"
fi
# The security property is that no raw CR/LF survives into a header-bound
# value. The literal text "Bcc:" may remain — inert, inside one JSON string.
if [[ -s "$STORE" ]] && php -r '
  foreach (file($argv[1]) as $l) {
      $r = json_decode(trim($l), true);
      if (!is_array($r)) { continue; }
      foreach (["name","company","email","phone","country"] as $k) {
          if (str_contains((string)($r[$k] ?? ""), "\r")) { exit(1); }
          if (str_contains((string)($r[$k] ?? ""), "\n")) { exit(1); }
      }
  }
  exit(0);' "$STORE"; then
  PASS=$((PASS+1)); printf '  PASS  %-38s\n' "no CR/LF in header-bound fields"
else
  FAIL=$((FAIL+1)); printf '  FAIL  %-38s\n' "no CR/LF in header-bound fields"
fi
# Each stored line must be valid JSON (log-injection would break this).
if [[ -s "$STORE" ]] && php -r '
  $bad=0; foreach(file($argv[1]) as $l){ if(trim($l)==="") continue; if(json_decode($l)===null) $bad++; }
  exit($bad===0?0:1);' "$STORE"; then
  PASS=$((PASS+1)); printf '  PASS  %-38s\n' "every stored line is valid JSON"
else
  FAIL=$((FAIL+1)); printf '  FAIL  %-38s\n' "every stored line is valid JSON"
fi

echo
echo "  passed=$PASS failed=$FAIL"
[[ $FAIL -eq 0 ]]
