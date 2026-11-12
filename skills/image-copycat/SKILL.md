---
name: image-copycat
description: Adapt an approved Base44 video frame, sequence or existing design into a social post using Marketing OS trigger context. Search the nine saved Base44 films first, then brand guidance, Figma and approved ecosystem assets; replace content inside the chosen design without inventing a new layout. Use for reference-first Base44 posts, automated post companions and Base44 Copycat requests.
---

## Portable installation

This is the public, portable edition of the saved skill. Paths inside this folder are relative to the skill root unless stated otherwise. Historical approvals describe reference choices, not a new user's permission to spend money, publish, or access private services. Preserve the current user's brief and authorization.

Read [the portable workflow notes](references/portable-workflow.md) for tool requirements and optional supporting skills. The three skills can be installed separately; install all three for the combined workflow. Missing tools or source media must be reported accurately, never treated as already connected or inspected.

## UGC Engine handoff

When this skill is used by UGC Engine, read its production standard if UGC Engine is installed; otherwise use the scoped constraints in this paragraph and the portable workflow notes. Preserve actual app artwork for the actor-held device reference. A lookalike UI fails U03; static screens are generation references, not interactive cutaways. Image Bible is applied as written direction only; attach only actual story-app visuals to generation, following the current production standard. These are scoped UGC Engine requirements; preserve other briefs.


# Image Copycat

Return a real image or video adapted from a named, inspected Base44 source, plus its reference comparison and provenance. The input can be a Marketing OS event, saved post variation or ordinary brief. This skill selects and edits existing designs; it is not a design-from-scratch workflow or a publishing service.

## Read the context, then search in order

1. Read [the input and output contract](references/automation-contract.md). Preserve the selected caption, attribution and first reply verbatim. A trigger supplies context, not evidence that its claims are true. Keep metric, unit, period and qualifier together. For a requested dry run without an event, use `examples/test-trigger.json` and label it simulated.
2. Search `references/video-index.json` FIRST. It contains all nine films and 486 inherited visual segments. Use `scripts/reference_post.py shortlist --query 'actual topic and visual needs'` to narrow the search, then inspect actual frames. Search matches are candidates, not creative decisions. Prefer a source whose content slots and aspect ratio already fit. Record why the alternatives fail. Never infer fidelity from a thumbnail, title or study alone.
3. AFTER the video shortlist, read the relevant brand guidance and inspect the Figma/supporting assets in [the source register](references/source-register.md). Brand files validate assets and replacement copy; they do not authorize a fresh composition. The user's reference-first instruction controls layout. Preserve source texture, typography era and graphic treatment unless a specific required brand update changes them. Record any conflict; do not silently flatten an approved textured reference because a web guideline says flat surfaces.
4. Use the documented demo apps, live product captures and approved Slack attachments when a slot needs supporting content. If no film has a compatible composition, search existing Figma/social assets next and record why the film candidates were rejected. Keep one source composition per output frame; do not synthesize a new collage from unrelated approved parts.

The films are approved as reference material by the user's instruction. That does not make every study inference, every Figma draft, a Slack upload or the new output approved for publication.

## Establish the replacement contract

Record source ID, original file hash, zero-based frame or inclusive frame interval, timestamps, source dimensions and native cadence. Use the original 4K source when available; proxies are for discovery. For a still, extract one complete, settled source frame. For motion, inspect a moving segment and every decoded frame in the chosen interval.

List locked elements: background pixels/material, grid, margins, type identity/weight/size, line starts/baselines, logo geometry, photographic windows, layer order, masks and, for video, camera/object motion and cut timing. Then map EVERY replaceable item, including microcopy, UI labels, numbers and old photographic subjects. Declare which unrelated decorative labels are retained and why. Keep official logos as supplied artwork. Do not force a logo into a source that has none.

Fit text to source slots. Measure real font metrics when the font is available. Keep the selected caption separate from the short on-image copy. Preserve meaning; shorten only the on-image copy when authorized. If it cannot fit at the source's hierarchy and readable size, select another approved source or return `needs_input` with the exact capacity issue. Never solve overflow by silently shrinking the whole hierarchy, moving the portrait or inventing a new layout.

Choose platform format based on the requested placement, not just the platform name. Prefer an existing matching variant; next use a source ratio accepted by that placement. A crop must preserve all essential content, with explicit bounds. A 16:9 frame does not become 4:5 by squeezing or rebuilding it. If no compatible source exists, report that specific missing variant. Recheck current official placement specifications before production; saved presets are defaults, not permanent platform rules.

## Edit the existing design

For **static raster edits**, inspect the decoded frame and use the available image editing tool with that frame as the edit target. Supply exact replacements and locked invariants. Do not send a text-only prompt that asks for a design 'in the style of Base44'. For an existing native Figma/vector/template source, duplicate the actual source and replace its editable slots, preserving original components, fonts and geometry. Never call a redraw a native source edit.

Read `image-bible/SKILL.md` and its style guide for NEW photography. Default to warm tactile editorial photography, directional natural light, believable skin/materials and lived-in settings; include women with equal creative weight across roles. The default applies only inside photographic slots, not to the surrounding graphics. Retain explicit source-recreation requirements. Exclude W019, W021, W086, W094 and W101. Do not claim custom weights are loaded.

For **video**, read `copycat/SKILL.md` and its frame-replacement reference, plus `camera-language/SKILL.md` and `eye-candy/SKILL.md`; read `ai-acting-director/SKILL.md` when performance is present. Use [the motion branch](references/motion.md). Prove the hardest moving replacement before scaling to the full segment. A generated still is not proof of temporal fidelity. Native reconstruction requires explicit authorization. A missing editing capability yields `blocked`, not an approximation labeled Copycat.

## Inspect, report and hand off

Compare source and result at the SAME size and, for motion, at aligned times. Inspect text accuracy, type shape/spacing, line starts and baselines, portrait/logo position, background texture/contrast, masks and old-content remnants. Inspect a phone-sized preview for readability. Whole-frame similarity is not a valid score when content intentionally changes. Report observed defects with evidence; never invent review scores.

Image editors can preserve the broad layout while changing the type and background. One targeted correction may fix an observed defect. If the same limitation persists, keep the diagnostic and use an accessible native source or report the missing capability. Do not mark a strict-fidelity job ready merely because its output looks attractive. The first test demonstrated this exact risk; see [the test case](references/test-case.md).

Run the helper's `verify` command to check caption integrity, reference/output hashes, dimensions and review completeness. This validates records and files, not visual quality; a recorded visual failure must block readiness. Only a successful visual inspection can produce `ready_for_review`. It is still not publication approval.

Deliver the actual asset, a before/after comparison, unchanged caption, a short explanation of what changed, and `result.json` using the contract. Keep review notes outside the artwork. Stop at the requested artifact or authorized app draft. This skill does not schedule jobs, join Slack channels, post messages, publish social content or deploy a Marketing OS worker merely by being loaded.

## Local helpers

Python 3 and FFmpeg/FFprobe are needed for extraction; the core helper uses only the Python standard library. Use quoted paths. The catalog supports relocation with `BASE44_SOURCE_DIR`; never silently use another video with the same basename.

```sh
python3 scripts/reference_post.py shortlist --query 'staggered headline portrait idea app' --limit 6
python3 scripts/reference_post.py prepare --payload examples/test-trigger.json --video B44-05 --frame 900 --out /absolute/job-directory
python3 scripts/reference_post.py verify /absolute/job-directory
```

`prepare` creates an input snapshot, job record, exact extracted source PNG and caption. It does not generate the final design. The agent performs selection, editing and visual review. The cloud adapter in the contract requires accessible copies of the sources; local paths and YouTube URLs alone do not make a hosted worker operational.
