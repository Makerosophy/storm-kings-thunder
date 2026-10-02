#!/usr/bin/env python3
"""Render existing campaign images from an MDX post into a local MP4."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
IMAGE_ROOT = ROOT / "public" / "images"
OUTPUT_ROOT = ROOT / "output" / "videos"
IMAGE_REF = re.compile(r"images/sessions/(\d{3})/([^`\s\"}]+?\.(?:webp|png|jpe?g))", re.I)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--session", type=int, required=True, help="Session number, e.g. 19")
    parser.add_argument("--image", action="append", default=[], help="Image under public/images; repeat to set order")
    parser.add_argument("--name", help="Output basename under output/videos, without extension")
    parser.add_argument("--audio", help="Optional audio file inside this repository")
    parser.add_argument("--seconds-per-image", type=float, default=4.0)
    parser.add_argument("--transition", type=float, default=0.5, help="Crossfade duration in seconds")
    parser.add_argument("--width", type=int, default=1280)
    parser.add_argument("--height", type=int, default=720)
    parser.add_argument("--fps", type=int, default=24)
    parser.add_argument("--dry-run", action="store_true")
    return parser


def local_file(raw: str, root: Path) -> Path:
    candidate = Path(raw)
    if not candidate.is_absolute():
        candidate = ROOT / candidate
    resolved = candidate.resolve()
    if not resolved.is_relative_to(root.resolve()) or not resolved.is_file():
        raise ValueError(f"File inesistente o fuori dall'area consentita: {raw}")
    return resolved


def session_images(number: int, selected: list[str]) -> list[Path]:
    post = ROOT / "src" / "content" / "blog" / f"{number}-avventura.mdx"
    if not post.is_file():
        raise ValueError(f"Cronaca non trovata: {post}")
    if selected:
        images = []
        for value in selected:
            relative = value if value.startswith("public/") else f"public/{value}"
            images.append(local_file(relative, IMAGE_ROOT))
    else:
        seen: set[Path] = set()
        images = []
        for match in IMAGE_REF.finditer(post.read_text(encoding="utf-8")):
            if int(match.group(1)) != number:
                continue
            image = local_file(f"public/images/sessions/{match.group(1)}/{match.group(2)}", IMAGE_ROOT)
            if image not in seen:
                images.append(image)
                seen.add(image)
    if not images:
        raise ValueError(f"Nessuna immagine trovata per la sessione {number}")
    return images


def render_command(images: list[Path], audio: Path | None, args: argparse.Namespace, output: Path) -> tuple[list[str], float]:
    frames = round(args.seconds_per_image * args.fps)
    clip_seconds = frames / args.fps
    fade_frames = round(args.transition * args.fps) if len(images) > 1 else 0
    fade_seconds = fade_frames / args.fps
    duration = len(images) * clip_seconds - (len(images) - 1) * fade_seconds

    command = ["ffmpeg", "-hide_banner", "-nostdin", "-n"]
    for image in images:
        command += ["-i", str(image)]
    if audio:
        command += ["-stream_loop", "-1", "-i", str(audio)]

    filters = []
    for index in range(len(images)):
        filters.append(
            f"[{index}:v]scale={args.width}:{args.height}:force_original_aspect_ratio=increase,"
            f"crop={args.width}:{args.height},"
            f"zoompan=z='min(zoom+0.0007,1.06)':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':"
            f"d={frames}:s={args.width}x{args.height}:fps={args.fps},"
            f"setsar=1,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v{index}]"
        )
    video_label = "v0"
    if len(images) > 1 and fade_frames == 0:
        filters.append(f"{''.join(f'[v{index}]' for index in range(len(images)))}concat=n={len(images)}:v=1:a=0[video]")
        video_label = "video"
    else:
        for index in range(1, len(images)):
            output_label = f"x{index}"
            offset = index * (clip_seconds - fade_seconds)
            filters.append(
                f"[{video_label}][v{index}]xfade=transition=fade:"
                f"duration={fade_seconds:.6f}:offset={offset:.6f}[{output_label}]"
            )
            video_label = output_label

    command += ["-filter_complex", ";".join(filters), "-map", f"[{video_label}]"]
    if audio:
        command += ["-map", f"{len(images)}:a:0", "-c:a", "aac", "-b:a", "192k"]
    command += [
        "-t", f"{duration:.6f}", "-r", str(args.fps), "-c:v", "libx264",
        "-crf", "20", "-preset", "medium", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", str(output),
    ]
    return command, duration


def main() -> int:
    args = build_parser().parse_args()
    try:
        if not 1 <= args.session <= 999:
            raise ValueError("La sessione deve essere tra 1 e 999")
        if args.fps < 1 or args.fps > 60 or args.width < 2 or args.height < 2 or args.width % 2 or args.height % 2:
            raise ValueError("Usa FPS 1–60 e dimensioni positive e pari")
        if args.width > 3840 or args.height > 2160:
            raise ValueError("La risoluzione massima è 3840×2160")
        if args.seconds_per_image <= 0 or args.seconds_per_image > 30:
            raise ValueError("La durata per immagine deve essere tra 0 e 30 secondi")
        if args.transition < 0 or args.transition >= args.seconds_per_image:
            raise ValueError("La dissolvenza deve essere inferiore alla durata per immagine")
        if round(args.seconds_per_image * args.fps) < 2:
            raise ValueError("La durata per immagine deve produrre almeno due fotogrammi")
        if len(args.image) > 100:
            raise ValueError("Massimo 100 immagini")

        images = session_images(args.session, args.image)
        audio = local_file(args.audio, ROOT) if args.audio else None
        name = args.name or f"session-{args.session:03d}"
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]{0,79}", name):
            raise ValueError("Il nome del video può contenere solo lettere, numeri, trattini e underscore")
        output = OUTPUT_ROOT / f"{name}.mp4"
        command, duration = render_command(images, audio, args, output)
        plan = {
            "session": args.session,
            "images": [str(path.relative_to(ROOT)) for path in images],
            "audio": str(audio.relative_to(ROOT)) if audio else None,
            "duration_seconds": round(duration, 3),
            "output": str(output.relative_to(ROOT)),
        }
        print(json.dumps(plan, ensure_ascii=False, indent=2))
        if args.dry_run:
            return 0
        if output.exists():
            raise ValueError(f"Il video esiste già: {output}")
        if not shutil.which("ffmpeg"):
            raise ValueError("FFmpeg non trovato: installalo localmente prima di esportare")
        OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
        subprocess.run(command, check=True, cwd=ROOT)
        if not output.is_file() or output.stat().st_size == 0:
            raise ValueError("FFmpeg non ha prodotto un video valido")
        print(f"Video creato: {output}")
        return 0
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        print(f"Errore: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
