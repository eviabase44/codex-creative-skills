# Legacy full-frame generation workflow

Use this only when the user selects the original full-frame image-generation route. The current Figma/fixed-artwork route is in [motion-study-figma.md](motion-study-figma.md). Encoding checks below can be reused, but their image-generator provenance requirements do not apply to native Figma/Codex rendering.

Use Python 3, FFmpeg and FFprobe for the bundled helper. It analyzes and encodes only; the image generator performs visual recreation.

```sh
python3 scripts/sequence.py prepare /absolute/source.mp4 --start 4.0 --end 7.0 --out /absolute/work/sequence-01
```

Times are seconds from the first decoded video frame, with an exclusive end. Choose at least three seconds and preferably a whole number of twelfths so duration is exact at 12 fps. The helper reads actual presentation timestamps, extracts every native frame needed for the interval, samples the active source pose at each 1/12-second point, and saves source/frame hashes and the timing map. It refuses to overwrite an existing sequence directory.

Inspect native frames around cuts as well as the 12 fps samples. A transition shorter than one output frame can be undersampled; disclose the quantization rather than adding an invented transition. Keep the source's clock. The helper rounds duration upward by less than one output frame, recording the difference; do not add any further holds.

## Generate

Prepare stable app/subject reference artwork and full-frame prompts. Example structure:

```text
Create a complete new frame for sequence [id], output [index], source time [time].
Reference 1: source pose and composition, not a backdrop to preserve pixel-for-pixel.
Reference 2: fixed replacement app/subject design and identity.
Reference 3: accepted adjacent output for visual continuity, not a substitute pose.
New context and exact visible text: [...].
Match this source pose: [camera, placement/scale, perspective, occlusion, action].
Preserve design: [grid, type hierarchy, margins, components, material/light].
State now: [UI/scroll/cursor or character/prop state].
Recreate the entire image; no patched text boxes or source footage underneath.
Sharp instantaneous frame for 12 fps stepped animation. No motion blur,
directional smear, ghost images or frame blending. Retain [intentional focus].
```

Generate full replacement images one frame at a time by default. If a fixed-grid batch is used, every cell must correspond to an explicit source index, retain adequate resolution, and be inspected before slicing. Reject cell rearrangements, fused cells, inconsistent scale, illegible UI and invented poses. A batch is an image-generation convenience, not permission to skip frames. Follow the active image tool's actual capabilities and invocation rules.

Save final generated frames as `generated/000001.png` onward at source dimensions. If the generator returns another size, maintain aspect ratio, use one consistent resampling/padding policy and document it; never squeeze the app or silently crop source geometry. Aspect-ratio drift requires repair. PNG conversion, fixed-grid slicing and uniform size normalization are mechanical finishing operations; do not use them to repaint or patch the source.

Keep original tool outputs and generation evidence separately. Reuse frames only for demonstrated original holds. Inspect a complete three-second pilot in motion before extending the method to all sequences.

## Encode

```sh
python3 scripts/sequence.py assemble /absolute/work/sequence-01
```

Requires exactly the planned generated PNG count and source dimensions. Produces `source-12fps.mp4`, `regenerated-12fps.mp4` and `comparison.mp4`, silent visual-review files with source left and regeneration right. It refuses missing frames, unchanged source PNGs, shape mismatches and preexisting output videos. The no-identical-source check is only a basic mistake detector; it does not prove full-frame generation.

The helper uses numbered frames at 12 fps with no blending, interpolation or motion-blur filters and verifies complete decoding, frame count, rate and duration. It cannot detect every duplicate-looking image, blur inside generated pixels, camera drift, UI identity change, or a forged provenance record. Inspect these visually. It never marks a sequence ready or approved.

Add labels and source timestamps in an external comparison border/companion player when presenting. Retain the silent comparison for inspection; when source audio exists, also prepare a synchronized comparison version with its original audio unless the user requested silence. Do not mix two copies of the same audio. Trimming/encoding audio must preserve the selected interval and its synchronization.

Present each complete moving comparison. A contact sheet alone cannot clear approval. Link the original native-cadence clip as additional evidence where 12 fps quantization affects perceived motion.
