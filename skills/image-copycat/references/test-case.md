# First local test, 2026-10-05

Input: `examples/test-trigger.json`, a simulated LinkedIn organic single-photo job, 1200×675. Caption locked. Headline: `Your idea / becomes / an app`. This is not a live event, a feature announcement or approved campaign copy.

Source selection: B44-05 Superagent, shot 25, source frame 900, 37.500 seconds at 24 fps. The 3840×2160 original was freshly decoded and inspected. Its cascading headline has three usable slots, a small portrait and a 16:9 composition. The existing source has no logo on this frame; no new logo was inserted. B44-01's opening needs fewer headline lines and a larger presenter window; B44-07's client-brief composition suggests a different story and contains more topic-specific context. These alternatives were considered from the inherited study, not freshly visually audited during this test.

Applied replacement: exact new headline; all four metadata labels changed; presenter replaced with a fictional woman in a naturally lit studio, using Image Bible's group-A light, materials and relaxed posture. The main composition, orange marker and portrait window remain recognizably derived from the source. No new source design was composed.

Execution: two built-in image edits (initial edit and one correction), followed by technical resizing to the requested 1200×675 PNG. The source and edited output were viewed. The correction reduced some shading, but did not establish exact source typography or preserve the original faint background/texture. The renderer returned 1672×941 rather than 4K; no 4K quality claim is made. The export's tiny aspect rounding is disclosed in the run record.

Result: `diagnostic`, not `ready_for_review` under the strict fidelity requirement. The source selection, actual frame edit, copy substitution and local contract are demonstrated. Exact font/background preservation, live trigger dispatch, automated upload/save, Slack discovery, access to the demo-app Figma node and moving-video fidelity are not demonstrated.

Narrow lesson: source-frame prompting alone does not guarantee immutable design pixels. Prefer editable approved source assets where available, or a validated region-preserving editing method for strict jobs. Keep the visible diagnostic; do not hide the failure or silently relax the user's no-redesign requirement. This limitation does not justify asking for approval at every routine selection step.

Reusable checks: `python3 -m unittest discover -s scripts -p 'test_*.py' -v`. They verify caption integrity, simulated/production separation, reference/output tampering, recorded failed visual checks, dimensions, static/video separation and retrieval of a known visual mechanism. They do not judge artistic quality.
