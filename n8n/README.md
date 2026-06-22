# Qual Engine — n8n Pipeline (visible / ecosystem version)

`qual-engine-pipeline.json` is the analysis pipeline as an importable n8n workflow:
the same 3 Claude stages as the backend, but rendered on the n8n canvas — useful for
demos ("here is the agent's brain, visualized") and for reuse across ecosystem workflows.

```
Webhook (POST /qual-engine)
   → Build Themes Prompt → Claude: Themes   → Parse
   → Build Verbatim Prompt → Claude: Verbatims → Parse
   → Build Topline Prompt → Claude: Topline  → Merge
   → Respond (JSON)
```

## Import & wire up
1. n8n → Workflows → Import from File → pick `qual-engine-pipeline.json`.
2. Create a credential: **Header Auth** named `Anthropic API` →
   Name = `x-api-key`, Value = your Anthropic key. Assign it to the three HTTP nodes
   (they reference a placeholder credential id on import).
3. Activate, then POST to the webhook:
   ```bash
   curl -X POST https://<your-n8n>/webhook/qual-engine \
     -H 'content-type: application/json' \
     -d '{"transcript":"MODERATOR: ... RESPONDEN 1: ..."}'
   ```
   Returns `{ respondentCount, themes, verbatims, topline, implications }`.

## How it relates to the product
- **Product hot path** stays on FastAPI + Celery (auth, multi-tenant, usage, NDA data
  never leaves your infra).
- **This workflow** is the *conductor / ecosystem* version: trigger Qual Engine from a
  larger n8n flow, or show it on the canvas during the pitch.
- To make the FastAPI backend route through n8n instead of Celery, replace the body of
  `run_analysis` in `backend/app/tasks.py` with a single HTTP POST to this webhook and
  persist the returned JSON. The API contract and the React frontend stay identical.

> Note: model is hardcoded to `claude-sonnet-4-6` in the HTTP nodes — edit if needed.
