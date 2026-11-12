# Marketing OS adapter contract

This is a local skill and an integration contract, not an installed event listener. No live Marketing OS code was changed by creating it.

## Input

Use `examples/test-trigger.json` as the executable example. Required normalized fields: `schema_version: 1`, nonempty `event_id`, `mode` (`dry_run` or `production`), nonempty `topic`, `platform`, `placement`, `kind` (`image` or `video`), positive integer `width`/`height`, `post_media_caption` (nonempty string), and `on_image_copy` (nonempty array of strings). Optional: `variation_id`, `first_reply`, `attribution`, `audience`, `proofs`, `asset_refs`, `allow_on_image_rewrite`, `duration_seconds`, source override.

Recoverable existing app fields: `post_media_version: 1`, `post_media_creative_profile: "base44-post-media-2026-10-04"`, `post_media_caption`, and `topic`. The normalized fields above are a proposed adapter, not a claim that all exist in the current app schema. Keep extra trigger fields in the input snapshot. Preserve original Unicode and whitespace in caption/reply/attribution, and hash the exact caption bytes. Never substitute topic for a missing caption. Never default silently to a different saved variation.

`proofs` should tie each factual claim to a source ID/URL, retrieval date, exact scope and verification status. A fact inside a trigger is not automatically verified. The test fixture is simulated and makes no release, pricing or metric claim. For a real event without sufficient proof, continue source selection and return `needs_input` for the specific missing fact, or omit that fact if the brief permits. Keep historical film claims separate from current product facts.

## Idempotency and context changes

The helper derives a run key from the event ID, canonical input hash, chosen source hash and frame. The same invocation in the same directory returns the existing job; a changed payload or source refuses to overwrite it. A new revision gets a new job directory and requires a new visual review. Preserve the exact source and output hashes reviewed. Hosted retries should use this same key when saving a draft, avoiding duplicate assets/posts.

## Selection record

Save source ID/hash/frame range or Figma file/node/version, approval evidence, candidate alternatives/rejection reasons, source aspect, slot map, immutable elements, approved changes, font files, photo direction and format transformation. Literal character counts only shortlist; render-width measurement and visual inspection decide copy fit. For metric posts, reject slots that cannot hold the value AND its qualifier. Do not change units to fit.

## Result

`result.json` must contain:

```json
{
  "status": "ready_for_review",
  "job_key": "from job.json",
  "caption_sha256": "exact caption bytes",
  "reference_sha256": "extracted reference PNG",
  "output": {"path": "asset.png", "sha256": "hash", "width": 1200, "height": 675},
  "comparison": "comparison.html",
  "selection": {},
  "replacements": [],
  "review": {
    "output_sha256": "same reviewed output hash",
    "checks": {
      "copy_exact": true,
      "layout_preserved": true,
      "type_preserved": true,
      "texture_preserved": true,
      "assets_correct": true,
      "platform_fit": true,
      "old_content_removed": true
    },
    "observations": "Specific evidence from actual inspection"
  },
  "limitations": []
}
```

Allowed statuses: `ready_for_review`, `needs_input`, `blocked`, `diagnostic`. These are proposed output statuses. Map them to actual Marketing OS draft fields through its real adapter; never invent an API endpoint. A diagnostic may include a real image that fails strict fidelity. A failed check cannot be marked ready. `ready_for_review` does not mean approved or published. Video readiness additionally requires the motion evidence in `motion.md`; the static helper deliberately refuses to certify video.

For blocked/needs_input jobs, include the reason and unresolved field/source. If no render exists, do not fabricate an output. Deliver review evidence with the artifact, outside the public-facing artwork.

## Hosted worker handoff

Package the skill, relevant guide excerpts with hashes, chosen source frames/clip, timing map, official logos/fonts where licensed, replacement assets, normalized input and immutable job ID. Store media where the worker is authorized to read it. Do not send short-lived connector tokens in prompts or manifests. Resolve media with the worker's supported upload/asset mechanism and check expiry before running.

The local index points to 4K files on Evia's computer. A hosted worker cannot read those paths. The test establishes local reference selection and still-image editing only. Connecting actual event dispatch, source hosting, model calls, storage and draft-save callbacks is a separate deployment step; do not claim end-to-end integration from a local test.

## Placement presets

Use platform-supplied dimensions when present and verify the specific placement. The initial static test uses a LinkedIn organic single-photo post at 1200×675 to preserve the source's 16:9 design. LinkedIn's [official photo help](https://www.linkedin.com/help/linkedin/answer/a527229/share-photos-or-videos?lang=en), checked 2026-10-05, allows photo ratios from 3:1 to 4:5. This is not the link-preview or paid-ad specification.

Other possible job dimensions include square 1080×1080, portrait 1080×1350 and 1600×900 landscape, but their platform/placement acceptance must be checked when requested. These dimensions do not authorize freeform composition changes.
