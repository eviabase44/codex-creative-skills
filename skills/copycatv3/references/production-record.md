# Production record

Keep the user's brief verbatim beside a compact structured record. Do not rewrite the original requirements into weaker self-authored acceptance criteria. A source inventory, technical verification, agent visual review and user approval are separate evidence.

## library.json

Record run date/timezone, channel URL, start/end dates, how listing completeness was established, and each video's ID, title, URL, exact publication date/date status, duration, local asset/hash if obtained, brand observation/evidence, inspection coverage, eligibility decision and reason. Include a sequence ID and continuous start/end timestamps for every eligible video. Pending entries remain in the denominator until resolved or explicitly removed by the user.

Each sequence records its route, story role, replacement context, shots/cuts, camera and performance state, source dimensions/native cadence, 12 fps frame map, stable app/design ID, references/prompts, rendered assets/hashes, comparison path/hash, technical checks, visual observations and approval state. For the Figma route also record the file URL/key, page name, start/end/intermediate node links, editable-layer exports/hashes, source motion measurements, inferred values and Motion Study validation findings.

Useful states: `inventory_pending`, `selected`, `design_ready`, `generating`, `failed_sample`, `ready_for_review`, `changes_requested`, `approved`. `approved` requires an actual user message identifying the reviewed version. Keep factual blockers separate from creative failure.

When using Present Flow, also record family/comp ID, source archive/AEP hashes, exact control snapshot, Figma node-to-layer mapping, native FPS and time units, sample-hold versus score-hold semantics, source-to-delivery sample map, expression dependencies, known issues, native evaluated-sample provenance and Codex port version. Keep separate statuses for kit integrity, native expression evaluation, port motion validation and user acceptance. The helper's `unverified_port` status changes only after actual motion comparison; do not promote it from a successful contract export.

Before Awwwards fallback, record full-window search completion, the missing design need and why the inspected Base44 candidates fail it. Record the external URL, inspected views and adaptation rationale.

## Generation evidence

For fixed-artwork/Figma rendering, retain generated asset outputs/prompts/hashes, Figma layer exports/hashes, motion-map version and render settings; every output frame must map to its source time and rendered pose. For legacy full-frame generation, retain each actual tool output path/hash, prompt, source-pose reference, design reference and neighboring accepted references. When a held frame is reused, record its origin and source evidence. Do not classify source images or native rendering as image-generator output.

The frame helper's `sequence.json` supplies timing, not generative provenance or visual review. Maintain generation/review records alongside it. A separate full batch inventory is still necessary.

## Review and approval

Record separate observations for geometry/camera, motion/cut flow, UI/identity continuity, typography/logo, material/light and no-motion-blur. Use timestamps, source/output pairs and actual playback. Automated similarity across changed content is not an acceptance score.

Record approval as: user message/date, sequence IDs, comparison hashes and decision. Altered pixels, timing, design or source interval invalidate the affected approval. Earlier approvals remain useful for unchanged assets; do not regenerate accepted work unnecessarily.

At handoff report discovered videos, eligible videos, selected sequences, regenerated sequences, review-ready sequences, approved sequences and pending blockers. Do not present inventory count as completed media count.
