# Creative skills for Codex

Three separate skills by [eviabase44](https://github.com/eviabase44) for photography direction, adapting existing designs, and recreating motion from references.

| Skill | What it does | Included |
|---|---|---|
| [Image Bible](skills/image-bible/SKILL.md) | Selects a character and location reference, then directs a distinct character and five deliberate location changes. | 197 retained photographic references, 700 saved location records/previews, review decisions, style guide and local review gallery. Rejected locations remain recorded and excluded from selection. |
| [Image Copycat](skills/image-copycat/SKILL.md) | Adapts an inspected Base44 frame or existing design while preserving its layout, typography and material. | Nine-film index with 486 visual segments, source shortlisting, extraction/verification helpers and an example trigger. |
| [Copycat v3](skills/copycatv3/SKILL.md) | Recreates reference sequences with editable designs, measured movement and 12 fps animation, followed by synchronized comparison. | Motion workflow, sequence helpers and the Present Flow reference kit with exact expressions, media, previews and native AE projects. |

These are instruction and reference packages. Media generation uses the tools connected to your own Codex environment.

## Install by asking Codex

Paste this into Codex on the computer where you want the skills installed:

```text
Use $skill-installer to install these three skills from the public GitHub
repository eviabase44/codex-creative-skills, branch main:

- skills/image-bible
- skills/image-copycat
- skills/copycatv3

Preserve any existing installations and report a name conflict before replacing them.
```

To install just one, give Codex its individual link:

- [Install Image Bible](https://github.com/eviabase44/codex-creative-skills/tree/main/skills/image-bible)
- [Install Image Copycat](https://github.com/eviabase44/codex-creative-skills/tree/main/skills/image-copycat)
- [Install Copycat v3](https://github.com/eviabase44/codex-creative-skills/tree/main/skills/copycatv3)

For example: `Use $skill-installer to install https://github.com/eviabase44/codex-creative-skills/tree/main/skills/image-bible`.

The skills should be available on your next Codex turn. If an older client does not refresh discovery, start a new chat or restart that client.

## Install from a local download

Requires Python 3.10 or later. Clone the repository, or use GitHub's **Code → Download ZIP**, extract it, and open a terminal in the extracted folder.

```sh
git clone https://github.com/eviabase44/codex-creative-skills.git
cd codex-creative-skills
python3 install.py
```

On Windows, use `py -3 install.py`. The installer copies all three skills into `$CODEX_HOME/skills`, or `~/.codex/skills` when `CODEX_HOME` is unset. It makes no network calls and refuses to overwrite existing skills.

```sh
# Preview the destinations without changing files.
python3 install.py --dry-run

# Install one skill.
python3 install.py --skill image-bible

# Use an explicit skills directory if your Codex setup uses another location.
python3 install.py --dest /path/to/your/skills
```

For an update, back up your existing skill folders, especially Image Bible's `locations/library/review-state.json`, then deliberately move the old folders out of the install directory before installing the new version. Do not overwrite personal review decisions without reviewing them.

## Use the skills

```text
Use $image-bible to create a warm editorial photograph of a woman running
a small neighborhood workshop. Choose and inspect the reference pair first.
```

```text
Use $image-copycat to shortlist reference frames for a post about turning
an idea into an app. Show the selected source before adapting its design.
```

```text
Use $copycatv3 to plan a three-second pilot from this supplied source video.
Recreate it for my project with editable artwork, measured motion and a
synchronized comparison. Keep the larger library batch pending.
```

Copycat v3 retains the author's full-library workflow as its default; specify a pilot or narrower scope when that is what you want. Installing a skill does not start a batch or purchase generations.

## Tools and source media

| Requirement | When needed |
|---|---|
| An image generation/editing tool | Creating or adapting raster artwork. The skills do not include an API key or service subscription. |
| Python 3.10+ | Local helpers and installer. Python helpers use the standard library. |
| FFmpeg and FFprobe on PATH | Video frame extraction, encoding and technical checks. |
| Figma connection | Copycat v3's editable Figma route or native design editing. |
| Adobe After Effects and separately licensed fonts | Native evaluation of the Present Flow AEPs; documented requirements are in the kit. |
| Original reference videos | Image Copycat extraction and source-sequence recreation. Public film URLs and original hashes are included; the full films are not. |

Image Copycat shortlisting works immediately. For extraction, set `BASE44_SOURCE_DIR` to your folder containing the indexed original videos. A different encode must be deliberately inspected and reindexed; the helper rejects mismatched hashes.

The three folders work independently as skills. Installing all three enables their shared reference workflow. Camera Language, Eye Candy, AI Acting Director, Copycat, Motion Study, UGC Engine and brand plugins are optional external companions, not additional bundled skills. Each skill includes portable fallback guidance and reports missing capabilities when a requested production route needs them. Private Figma/Slack links and the author's private design database are not included. No LoRA weights are included or loaded.

## Check the package

From the repository root:

```sh
python3 skills/image-copycat/scripts/reference_post.py shortlist --query "cascading headline thumbnail" --limit 3
python3 skills/image-bible/locations/scripts/references.py --group L01 --limit 2
python3 skills/copycatv3/scripts/present_flow.py verify
python3 -m unittest discover -s skills/image-copycat/scripts -p 'test_*.py'
python3 -m unittest discover -s skills/copycatv3/scripts -p 'test_*.py'
```

Present Flow's normal integrity verification should pass. Its `--strict` mode intentionally reports nine preserved native inspection findings; compositions 707 and 6897 remain restricted. See [known issues](skills/copycatv3/assets/present-flow-approved-kit/docs/KNOWN-ISSUES.md). Integrity checks and regression tests do not certify rendered motion quality.

To review the locations locally, run:

```sh
python3 skills/image-bible/locations/library/launch_review.py --open
```

## Public package notes

This edition was packaged on 2026-11-12 from the author's installed skills. It keeps them separate, materializes the linked location library, removes logs/caches and private workspace locators, and makes indexed video paths portable. Extracted motion metadata uses relative paths. Native AEP snapshots and authored expression/media bytes are preserved; AEPs may retain historical source paths and require relinking to the bundled media on another device.

The reference material is shared for the skill workflow. See [NOTICE.md](NOTICE.md) for the distinction between installing these skills and rights in reference media. Historical approval records concern the original reference choices; they do not approve a new user's generated work or authorize publication.
