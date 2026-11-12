# Location Bible review

Open **Open Review.command** to launch the gallery with automatic saving. You can also open **index.html** directly; in that mode, decisions are kept in the browser and must be exported for import into the skill.

The library stores 100 reference images from each of the seven supplied Pinterest links. A single-pin source includes that seed and related pins encountered while scrolling. Every card links to its original pin. Cross-source repeats retain their source membership, but one rejection applies to every copy of the same Pinterest image.

- **Keep:** retain the reference in the Bible or restore a rejected image. Every image is kept by default.
- **Reject:** exclude it from future positive reference selection. The image stays available as an exclusion record.
- **↺:** restore it to kept.
- **Flagged for review:** inspect agent-identified setting drift, tight details, overlays or collages. A flag is advisory; flagged images remain kept unless you reject them.
- Click an image for a full preview and optional note. Use left/right arrows to browse, K to keep, R to reject and U to restore to kept.

The Image Bible reads **review-state.json** every time it selects location references. The user approved all saved location images on 29 October 2026 unless explicitly rejected. Missing decisions and legacy unreviewed statuses mean kept. This extends the Bible alongside the earlier 197-reference collection. The existing LoRA and original approved library have not been changed.

The manifest, local image files and per-image review state are the canonical library. The installed Image Bible's `locations/library` link points here, so keep this folder in place.
