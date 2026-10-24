#!/usr/bin/env bash
#
# Page-level smoke test against a running deployment.
#
#   scripts/smoke-test.sh <base-url> [path ...]
#
#   scripts/smoke-test.sh https://inkonchain.com
#   scripts/smoke-test.sh https://ink-web-app-git-<branch>-ink-foundation1.vercel.app /bridge
#
# Every path is requested SMOKE_ATTEMPTS times (default 3). Each response must
# be HTTP 200 and, for page routes, a complete HTML document that is not the
# Next.js error shell (`__next_error__`).
#
# Why pages and why several times: /api/health only proves the Node process is
# up. During the Oct 2026 incident (#397) it kept returning 200 while page
# routes 500'd on some Vercel instances, so a single request could land on a
# healthy instance and pass. Transport errors (DNS, TLS, timeouts) are retried;
# HTTP failures are not.
#
# Env: SMOKE_ATTEMPTS (3), SMOKE_TIMEOUT seconds per request (30).
set -uo pipefail

DEFAULT_PATHS=(/ /apps /bridge /faucet /api/health)

if [ $# -lt 1 ]; then
  echo "usage: $0 <base-url> [path ...]" >&2
  exit 2
fi

BASE_URL="${1%/}"
shift
PATHS=("$@")
if [ ${#PATHS[@]} -eq 0 ]; then
  PATHS=("${DEFAULT_PATHS[@]}")
fi
ATTEMPTS="${SMOKE_ATTEMPTS:-3}"
TIMEOUT="${SMOKE_TIMEOUT:-30}"

BODY="$(mktemp)"
ERR="$(mktemp)"
trap 'rm -f "$BODY" "$ERR"' EXIT

passed=0
failed=0
report=()

# request <url>; sets $code and $seconds, returns curl's exit code.
request() {
  local url="$1" out rc try
  for try in 1 2 3; do
    out="$(curl -sS -L -o "$BODY" -w '%{http_code} %{time_total}' \
      --max-time "$TIMEOUT" \
      -H 'Cache-Control: no-cache' \
      -A 'ink-web-app-smoke-test/1.0 (+https://github.com/inkonchain/ink-web-app)' \
      "$url" 2>"$ERR")"
    rc=$?
    if [ $rc -eq 0 ]; then
      code="${out%% *}"
      seconds="${out##* }"
      return 0
    fi
    if [ $try -lt 3 ]; then
      sleep 2
    fi
  done
  code="---"
  seconds="-"
  return $rc
}

# check <path> <attempt>; prints a result line and returns 0 (pass) or 1 (fail).
check() {
  local path="$1" attempt="$2" url="$BASE_URL$1" reason="" detail="" code seconds

  if ! request "$url"; then
    reason="curl failed: $(tr -d '\n' <"$ERR")"
  elif [ "$code" != "200" ]; then
    reason="HTTP $code"
    case "$code" in
      401 | 403) reason="$reason (deployment protection or auth in front of the site?)" ;;
      5*) grep -q '__next_error__' "$BODY" && reason="$reason (Next.js error shell)" ;;
    esac
  elif [[ "$path" != /api/* ]]; then
    if grep -q '__next_error__' "$BODY"; then
      reason="HTTP 200 but body is the Next.js error shell"
    elif ! grep -q '</html>' "$BODY"; then
      reason="HTTP 200 but HTML is truncated (no </html>)"
    fi
  elif [ "$path" = "/api/health" ]; then
    # Surface which runtime answered; useful when failures are instance-specific.
    detail="$(grep -oE '"(node|region|deployment)":"[^"]*"' "$BODY" | tr -d '"' | tr '\n' ' ')"
  fi

  if [ -z "$reason" ]; then
    printf 'ok    %s  %6ss  %s %s\n' "$code" "$seconds" "$path" "$detail"
    return 0
  fi
  printf 'FAIL  %s  %6ss  %s  %s\n' "$code" "$seconds" "$path" "$reason"
  report+=("- \`$path\` attempt $attempt: $reason")
  return 1
}

echo "Smoke testing $BASE_URL (${#PATHS[@]} paths x $ATTEMPTS attempts)"
for path in "${PATHS[@]}"; do
  for ((attempt = 1; attempt <= ATTEMPTS; attempt++)); do
    if check "$path" "$attempt"; then
      passed=$((passed + 1))
    else
      failed=$((failed + 1))
    fi
  done
done

total=$((passed + failed))
echo
echo "$passed/$total requests passed"

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    if [ $failed -eq 0 ]; then
      echo "### Smoke test passed: $BASE_URL"
      echo
      echo "$passed/$total requests OK across: ${PATHS[*]}"
    else
      echo "### Smoke test FAILED: $BASE_URL"
      echo
      echo "$failed/$total requests failed:"
      echo
      printf '%s\n' "${report[@]}"
    fi
  } >>"$GITHUB_STEP_SUMMARY"
fi

[ $failed -eq 0 ]
