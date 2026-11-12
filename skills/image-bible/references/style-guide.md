# Image Bible

Approved on 29 September 2026. 197 references are retained: 101 from the original collection and 96 women-focused additions. Five explicitly rejected images are excluded. This is the default creative direction for new photographic images and photographic video work in the user's local Codex setup, unless the current brief specifies another style. A separate experimental SDXL LoRA was recovered and saved on 30 September 2026; see the training status below.

## The look

Warm, tactile editorial photography of people comfortable in their surroundings. The place, materials and small actions tell part of the story. Favor a lived-in feeling, plausible light and unforced gestures. Translate this treatment to the requested subject instead of importing the reference subjects into every scene.

- **Light:** Directional window or doorway light indoors; real-looking sun and open shade outdoors. Retain natural falloff and some deep shadows. Warm does not mean uniformly yellow. For the flash branch, use a crisp frontal subject, harder shadows and darker surroundings.
- **Color:** Cream, warm brown, olive, faded blue and credible skin tones, with selected red, orange or stronger blue accents. Preserve useful color variation rather than flattening everything into beige.
- **Framing:** Human viewing distance. Medium and wider environmental views should leave enough room to read the setting. Use modest asymmetry, negative space, occasional foreground blur and tighter details when they serve the scene.
- **Perspective:** Moderate wide-to-normal perspective for environmental scenes, selective focus for details. A 35–50mm-equivalent feel is a useful optional prompt cue, not verified source metadata or a fixed lens requirement.
- **Texture:** Believable skin, hair, cloth, worn wood, metal, clay and paper. Keep meaningful surface variation. Any fine grain should be subtle and deliberate; avoid treating low-resolution compression as a film look to reproduce.
- **People:** Comfortable posture, absorbed attention, small purposeful gestures, ordinary pauses and smiles motivated by the moment. Keep the person specific and human without introducing a generic advertising grin into every scene.

## Six retained directions

| Group | Use | References: original / women | Useful anchors |
|---|---|---:|---|
| A · People in real workplaces | Core environmental portraits, real tools and shelves, loose seated or standing poses | 30 / 30 | P001, P002, W001, W002, W004 |
| B · Hands, materials and making | Core process scenes, occupied hands, tactile close details, concentrated work | 20 / 20 | P017, P050, W010, W017, W050 |
| C · Slow everyday life | Core domestic and cafe scenes, coffee, reading and working, soft window light | 17 / 17 | P009, P041, W009, W041, W046 |
| D · Sun, shade and open air | Outdoor extension: gardens, streets, fields, vehicles and porches | 17 / 17 | P036, P086, W036, W037, W085 |
| E · Direct-flash candid energy | Approved alternate for harder light, playful snapshots and stronger color | 8 / 8 | P025, P027, W025, W027, W033 |
| F · Fashion and commercial scenes | Approved alternate for deliberate outfit/product styling, plain backdrops and constructed sets | 9 / 4 | P018, P042, W018, W042, W068, W081 |

Choose the direction that fits the scene. A–C establish the general default; D carries it outdoors. E and F stay available without silently replacing the natural-light treatment in every brief. Their inclusion is approved and no longer on hold.

## Casting and character roles

Use women-focused and original references with equal weight. Women belong in the same active making, workplace, domestic, outdoor and candid roles as men. Across a varied series with unspecified casting, balance the coverage; a single image can have whichever cast its story needs. Respect explicit character requirements.

Character-role labels such as ceramicist, painter, woodworker, reader or photographer help describe a scene. They do not establish a real person's identity or biography. These references do not define recurring named characters. For a recurring fictional person, establish and preserve their appearance separately from this photographic style.

## Carry the look into video

The stills establish visual taste; the following motion choices are creative adaptations. Preserve the requested story, dialogue, pace and performance. When the brief is otherwise open, favor a stable frame or restrained handheld movement, small purposeful actions and natural pauses.

| Direction | Motion adaptation |
|---|---|
| A | Hold the environment while a person shifts weight, looks toward someone, or responds with a small smile. |
| B | Show one complete useful action, then a tactile detail. Preserve believable hand, tool and material contact. |
| C | Let a page turn, a mug lifted, a pour or a working pause set the rhythm. |
| D | Use walking, breeze, water or casual interaction; maintain the sun direction across the sequence. |
| E | Echo the harder near-camera light and candid energy; repeated flashes are not required. |
| F | Use controlled light, deliberately composed movement and garment or product presentation suited to the campaign. |

Maintain light direction, color treatment, wardrobe, material texture and relevant prop positions across cuts. Let performance direction determine the character's motivation and timing. The photographic default should support that performance rather than force every scene to be slow or still.

## Prompt integration

For UGC Engine, first apply the [parent skill's UGC exception](../SKILL.md#ugc-descriptive-bible-app-only-visual-inputs): internally inspect the Bible, translate it into written direction and attach only actual story-app visuals. The copy-and-attach template below is for other workflows. UGC uses ordinary phone capture and task-driven performance rather than editorial staging.

Follow [the two-reference workflow](../SKILL.md#copy-two-references-then-remix). For an image request without conflicting specific directions, select and inspect a relevant character image and a relevant location image. Copy their visual construction first, then remix the character and exactly five visible location elements. The directions above help select the pair; they do not replace actually inspecting and using both images.

Use this prompt structure, filling each bracket from the images and story: “Character reference [ID/input 1]: copy [pose, expression, styling and photographic presentation], then remix [specific appearance, hair, wardrobe and action changes] into the story's character. Location reference [ID/input 2]: copy [spatial structure, viewpoint, framing, depth, material relationships and photographic treatment]. Match [observed lighting direction, quality, falloff, shadows/highlights, contrast and palette]; illuminate the character consistently within that space. Change exactly these five location elements: 1. [original → replacement]; 2. [original → replacement]; 3. [original → replacement]; 4. [original → replacement]; 5. [original → replacement]. Keep the remaining spatial and photographic construction close to the location reference. Preserve [explicit subject, cast, brand and continuity requirements].”

Attach both images when supported; otherwise state that the observed breakdown is a text-only translation. Record reference IDs, paths and eligibility in the working brief or handoff. Keep reference metadata and the five-change plan out of on-image text. For photographic keyframes or video briefs, carry the same pair and final remix into the downstream direction, then add action, camera and continuity cues. Preserve established characters and spaces across connected shots instead of introducing five fresh changes every frame.

## Reference and training status

The approved collection contains review previews, source links, individual visual notes and same-group comparison pairs. Online pairs are alternatives, not shot-for-shot copies. Original authorship, photographic versus synthetic provenance, permissions and full-resolution suitability remain unverified.

An experimental SDXL LoRA completed 600 updates on a free Colab T4 using 48 captioned high-resolution sources: 24 from each collection, with all five exclusions omitted. Ten images were reviewed in the first run, and four fresh florist images were reviewed after recovery. The recovered adapter produced photographic women and men at strength 0.4. The first run showed that stronger settings can smear materials and distort hands or furniture. Start experimental use at strength 0.4 and review every result. The recovery run completed on 30 September 2026. Its final weights are verified locally and backed up to Drive. The model SHA-256 is 6707ca74fce1d891bec6986d756e42e91edc80374754f6ab5054024d62b1e865. The installed Codex default continues through instructions and reference selection; its native image generator cannot load the custom weights.

## Explicit exclusions

The user excluded these specific images in the review catalogue. They must not enter positive reference selection or training:

- **W019 · Workwear with a telephone prop**
- **W021 · Cream clothing on a plain backdrop**
- **W086 · A playful pose across an office desk**
- **W094 · Juggling a phone, papers and coffee**
- **W101 · White clothes on a dark studio stool**

All five are in group F. The four remaining women’s F references remain available. Do not generalize the exclusions into a ban on all fashion photography or clothing colors.
