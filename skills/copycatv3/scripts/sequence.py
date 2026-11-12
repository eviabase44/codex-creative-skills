#!/usr/bin/env python3
"""Prepare and encode Copycatv3 frames. Never generates images or grants approval."""
import argparse
from bisect import bisect_right
from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import shutil
import struct
import subprocess
import sys

FPS = 12


def require(ok, message):
    if not ok:
        raise ValueError(message)


def run(args):
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode:
        raise ValueError(result.stderr[-3000:] or "Command failed")
    return result.stdout


def sha(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def save(path, obj):
    path.write_text(json.dumps(obj, indent=2) + "\n")


def probe(path, frames=False):
    args = ["ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_streams", "-count_frames", "-of", "json"]
    if frames:
        args += ["-show_frames", "-show_entries",
                 "stream:frame=best_effort_timestamp_time,duration_time,pkt_duration_time"]
    return json.loads(run(args + [str(path)]))


def png_size(path):
    with path.open("rb") as f:
        data = f.read(24)
    require(len(data) == 24 and data[:8] == b"\x89PNG\r\n\x1a\n",
            f"Expected PNG: {path}")
    return struct.unpack(">II", data[16:24])


def prepare(args):
    source = Path(args.source).resolve()
    root = Path(args.out).resolve()
    require(source.is_file(), "Source is missing")
    require(not root.exists(), "Use a new output directory; existing work is preserved")
    require(math.isfinite(args.start) and math.isfinite(args.end), "Times must be finite")
    require(args.start >= 0 and args.end - args.start >= 3 - 1e-9,
            "Select a continuous source interval of at least three seconds")
    metadata = probe(source, frames=True)
    stream = metadata["streams"][0]
    decoded = metadata["frames"]
    pts = [float(f["best_effort_timestamp_time"]) for f in decoded]
    require(pts and all(b > a for a, b in zip(pts, pts[1:])),
            "Need strictly increasing decoded presentation timestamps")
    origin = pts[0]
    times = [t - origin for t in pts]
    rate = Fraction(stream["avg_frame_rate"])
    last_duration = float(decoded[-1].get("duration_time") or
                          decoded[-1].get("pkt_duration_time") or
                          (times[-1] - times[-2] if len(times) > 1 else 1 / float(rate)))
    require(args.end <= times[-1] + last_duration + 1e-7,
            "Selected interval extends beyond the decoded source")
    count = math.ceil((args.end - args.start) * FPS - 1e-8)
    source_indices = [bisect_right(times, args.start + i / FPS + 1e-9) - 1
                      for i in range(count)]
    lo = source_indices[0]
    hi = bisect_right(times, args.end - 1e-9) - 1
    require(lo >= 0 and hi >= lo, "Invalid source frame range")
    native = root / "native"
    samples = root / "source-12fps"
    for folder in (native, samples, root / "generated"):
        folder.mkdir(parents=True)
    run(["ffmpeg", "-v", "error", "-i", str(source), "-map", "0:v:0",
         "-vf", f"select=between(n\\,{lo}\\,{hi})", "-fps_mode", "passthrough",
         "-start_number", "1", str(native / "%06d.png")])
    native_files = sorted(native.glob("*.png"))
    require(len(native_files) == hi - lo + 1, "Native extraction count mismatch")
    size = png_size(native_files[0])
    require(size == (stream["width"], stream["height"]),
            "Display rotation or variable dimensions need explicit normalization")
    rows = []
    for i, source_index in enumerate(source_indices, 1):
        src = native / f"{source_index - lo + 1:06d}.png"
        dst = samples / f"{i:06d}.png"
        shutil.copyfile(src, dst)
        rows.append({"output_frame": i, "output_time": (i - 1) / FPS,
                     "source_sample_time": args.start + (i - 1) / FPS,
                     "source_frame_zero_based": source_index,
                     "source_pose_time": times[source_index],
                     "source_png": str(dst.relative_to(root)), "source_png_sha256": sha(dst),
                     "generated_png": f"generated/{i:06d}.png"})
    plan = {"schema_version": 1, "status": "prepared_not_generated",
            "source": str(source), "source_sha256": sha(source),
            "source_pts_origin": origin, "native_average_fps": str(rate),
            "start": args.start, "end": args.end, "fps": FPS,
            "width": size[0], "height": size[1], "frame_count": count,
            "output_duration": count / FPS,
            "endpoint_rounding_seconds": count / FPS - (args.end - args.start),
            "native_frames": [{"source_frame_zero_based": n, "time": times[n],
                               "file": f"native/{n - lo + 1:06d}.png"}
                              for n in range(lo, hi + 1)], "frames": rows}
    save(root / "sequence.json", plan)
    print(json.dumps({"status": plan["status"], "frames_to_generate": count,
                      "native_frames": hi - lo + 1, "directory": str(root)}))


def verify_video(path, count, size):
    meta = probe(path, frames=True)
    s = meta["streams"][0]
    require(Fraction(s["avg_frame_rate"]) == FPS, f"Wrong FPS: {path}")
    require(int(s["nb_read_frames"]) == count, f"Wrong frame count: {path}")
    require((s["width"], s["height"]) == size, f"Wrong dimensions: {path}")
    require(abs(float(s["duration"]) - count / FPS) < 1e-4, f"Wrong duration: {path}")
    stamps = [float(f["best_effort_timestamp_time"]) for f in meta["frames"]]
    require(len(stamps) == count and all(abs(t - i / FPS) < 1e-4
                                        for i, t in enumerate(stamps)),
            f"Wrong presentation cadence: {path}")
    run(["ffmpeg", "-v", "error", "-xerror", "-i", str(path), "-f", "null", "-"])
    return {"path": path.name, "sha256": sha(path), "fps": FPS,
            "frames": count, "duration": count / FPS, "dimensions": size}


def assemble(args):
    root = Path(args.directory).resolve()
    plan = json.loads((root / "sequence.json").read_text())
    count = plan["frame_count"]
    require(plan["fps"] == FPS and count >= 36, "Invalid 12 fps sequence plan")
    rows = plan["frames"]
    require(len(rows) == count and [r["output_frame"] for r in rows] == list(range(1, count + 1)),
            "Frame map is incomplete or out of order")
    size = (plan["width"], plan["height"])
    expected = {f"{i:06d}.png" for i in range(1, count + 1)}
    require({p.name for p in (root / "generated").glob("*.png")} == expected,
            "Generated PNGs must exactly cover every planned frame, with no extra PNGs")
    generated = []
    for row in rows:
        index = row["output_frame"]
        require(row["source_png"] == f"source-12fps/{index:06d}.png" and
                row["generated_png"] == f"generated/{index:06d}.png",
                "Unexpected image path in frame map")
        src, dst = root / row["source_png"], root / row["generated_png"]
        require(sha(src) == row["source_png_sha256"], "Source reference PNG was modified")
        require(png_size(dst) == size, f"Generated frame dimensions differ: {dst.name}")
        digest = sha(dst)
        require(digest != row["source_png_sha256"],
                f"Frame {index} is an unchanged source PNG, not a regenerated frame")
        generated.append({"frame": index, "sha256": digest})
    paths = [root / x for x in ("source-12fps.mp4", "regenerated-12fps.mp4", "comparison.mp4")]
    require(not any(p.exists() for p in paths), "Use a new version directory before re-encoding")
    pixel_format = "yuv420p" if not (size[0] % 2 or size[1] % 2) else "yuv444p"
    codec = ["-an", "-c:v", "libx264", "-crf", "16", "-pix_fmt", pixel_format,
             "-movflags", "+faststart"]
    for folder, output in zip(("source-12fps", "generated"), paths[:2]):
        run(["ffmpeg", "-v", "error", "-framerate", str(FPS), "-start_number", "1",
             "-i", str(root / folder / "%06d.png"), "-frames:v", str(count)] + codec + [str(output)])
    run(["ffmpeg", "-v", "error", "-i", str(paths[0]), "-i", str(paths[1]),
         "-filter_complex", "[0:v][1:v]hstack=inputs=2[v]", "-map", "[v]",
         "-frames:v", str(count)] + codec + [str(paths[2])])
    videos = [verify_video(p, count, (size[0] * (2 if i == 2 else 1), size[1]))
              for i, p in enumerate(paths)]
    report = {"status": "encoded_only_visual_review_and_user_approval_pending",
              "plan_sha256": sha(root / "sequence.json"), "videos": videos,
              "generated_frames": generated, "comparison_sides": "source left, regeneration right",
              "audio": "silent technical preview; preserve source audio in presentation when applicable",
              "limitations": "Does not verify generator provenance, visual fidelity or blur inside images"}
    save(root / "encoding-report.json", report)
    print(json.dumps({"status": report["status"], "comparison": str(paths[2])}))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    prep = commands.add_parser("prepare")
    prep.add_argument("source")
    prep.add_argument("--start", type=float, required=True)
    prep.add_argument("--end", type=float, required=True)
    prep.add_argument("--out", required=True)
    build = commands.add_parser("assemble")
    build.add_argument("directory")
    args = parser.parse_args()
    for tool in ("ffmpeg", "ffprobe"):
        require(shutil.which(tool), f"Missing {tool}")
    (prepare if args.command == "prepare" else assemble)(args)


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError, IndexError, ZeroDivisionError) as error:
        print(f"Copycatv3: {error}", file=sys.stderr)
        sys.exit(1)
