/**
 * AmbiSecure discovery-assistant configuration.
 *
 * This is the static-site mirror of the build-time flag
 *   ENABLE_AI_ASSISTANT=false
 * (see docs/search-assistant-roadmap.md and docs/search-assistant.env.example).
 *
 * AI is DISABLED BY DEFAULT and MUST remain disabled in production. The
 * shipped "Ask AmbiSecure" assistant (assets/js/ask-ambisecure.js) is a
 * deterministic, non-AI search/intent router — it has no model and makes no
 * API calls. The flag below only documents readiness for a *future* AI
 * retrieval mode; no AI code path exists in this codebase today.
 *
 * tools/audit-search.py asserts that enableAI stays false and that no AI
 * provider SDK / endpoint / API key is ever bundled.
 */
window.AS_ASSISTANT_CONFIG = {
  // ENABLE_AI_ASSISTANT — keep false. Flipping this true does NOT enable AI
  // (there is no AI implementation); it only reserves the future hook.
  enableAI: false,

  // Future AI mode (when built) MUST obey these invariants:
  retrieval: {
    // Answer ONLY from the AmbiSecure search index — no open-web generation.
    sourceAllowlist: ['/assets/data/search-index.json'],
    // Every answer must cite the source pages it drew from.
    requireCitations: true
  }
};
