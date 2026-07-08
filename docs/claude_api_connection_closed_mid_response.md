# Troubleshooting: "API Error: Connection closed mid-response"

> **Scope:** This is a **Claude Code (client ↔ Anthropic API) transport issue**, *not* specific to
> the ambisecure-site repo. This note lives here for convenience; nothing in this repository causes
> or fixes it. No repo code, script, or config is involved.

## The message

```
API Error: Connection closed mid-response. The response above may be incomplete.
```

Claude Code prints this when the **streaming HTTP response from the Anthropic API is terminated
before the assistant finishes the turn**. The partial answer already rendered is kept; the rest is lost.

## Environment observed (2026-07-08)

- Runner: **Claude Code VS Code extension** — native binary `2.1.204`, CLI shim `2.1.199`
  (`AI_AGENT=claude-code_2-1-204_agent`, `CLAUDE_CODE_ENTRYPOINT=claude-vscode`).
- API: **first-party Anthropic**. No `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`, `*_PROXY`, or wrapper
  env vars set → **not** OpenCode, **not** a proxy/wrapper/provider integration, **not** a model-name misconfig.
- Node `v26`.

## Root cause (evidence-based)

The failure is a **transient, server-/transport-side stream interruption**, correlated with **long,
expensive turns over a very large conversation context**. Two co-occurring causes appear in this
session's logs (`~/.claude/projects/<project>/<session>.jsonl`):

| Signature | Count | Meaning |
|---|---:|---|
| `overloaded_error`, `529 Overloaded`, `status code 529` | 5 / 1 / 1 | Anthropic API temporarily overloaded (capacity) |
| `APIConnectionError` | 4 | client could not keep/complete the HTTP connection |
| `ECONNRESET`, `socket hang up`, `ETIMEDOUT`, `terminated` | 5 / 5 / 5 / 2 | TCP/TLS connection reset or timed out mid-stream |

The specific incident was on an unusually **large, multi-tool turn** near the top of a very long
session. Short/medium turns throughout the same session succeeded — i.e. **it fails on long/large
turns, not on all prompts**. Long streams stay open longer, so they are more exposed to (a) 529
overload retries that can drop mid-stream and (b) connection recycling / idle timeouts / network blips.

### What it is NOT
- Not OpenCode (Claude Code is the active runner).
- Not a wrapper / proxy / provider integration (none configured).
- Not a wrong model/provider name (first-party, default model).
- Not a repo script/tooling bug.
- Not the terminal truncating output (that is a different, local symptom; this is a network stream close).
- Not auth/quota — a quota/rate problem returns HTTP 429, not the 529/transport pattern seen here.

## Fixes / mitigations (local, safe)

Because the cause is server-/transport-side and transient, there is **no local config bug to fix**.
In order of effectiveness:

1. **Retry.** Re-send the prompt or type `continue`. It almost always succeeds on the next attempt.
2. **Shrink the turn and the context** — the single biggest lever for mid-stream closes:
   - Run `/compact` to compress the conversation, or start a **new session** for the next chunk.
   - Break large multi-file / many-tool requests into smaller turns.
3. **Keep the extension updated.** Update the VS Code "Claude Code" extension (and the `claude` CLI)
   to the latest version so client-side retry/backoff is current. Observed: extension `2.1.204`,
   CLI `2.1.199` — bring both to latest.
4. **Stable network.** Avoid flaky Wi‑Fi / VPN during long turns; corporate proxies that recycle
   idle sockets make mid-stream closes more likely.
5. **During Anthropic incidents**, 529s spike site-wide — check <https://status.anthropic.com>.
   Wait and retry; nothing local will help until capacity recovers.

> **Streaming cannot be disabled** in the Claude Code extension (it always streams), so "turn off
> streaming" is not an available workaround here. (Only raw Anthropic SDK/API callers can choose
> non-streaming requests.)

## How to verify you're unblocked

- Re-send a **short** prompt → succeeds (client + auth are healthy).
- Re-send the **long** request after `/compact` or in a fresh session → completes without the message.
- `claude --version` runs and the extension shows no update pending.

## Fallback if it happens again

1. `continue` / re-send once (transient).
2. `/compact`, then re-send; or open a new session and paste only the needed context.
3. Split the request into smaller steps.
4. If 529s persist, check <https://status.anthropic.com> — it's an Anthropic-side capacity event; retry later.
