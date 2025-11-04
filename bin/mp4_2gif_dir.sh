#!/usr/bin/env bash
set -e

usage() {
    echo "Usage: $0 /path/to/dir [crop]"
    echo
    echo "Converts all .mp4 files in given directory to .gif. Optionally use provided crop."
    echo "If no crop given, prints recommended crop values for each."
    echo
    echo "Example crop value: 1584:1072:168:4"
    exit 1
}

if [ "$#" -lt 1 ]; then
    usage
fi

DIR=${1:-.}
CROP=$2
SKIP=0

if [ ! -d "$DIR" ]; then
    echo "Error: Directory '$DIR' does not exist"
    exit 1
fi

for MP4 in "$DIR"/*.mp4; do
    [[ -f "$MP4" ]] || continue
    OUT="${MP4%.mp4}.gif"
    if [ -z "$CROP" ]; then
        echo "--- No crop supplied for $MP4. Possible crop values:"
        ffmpeg -ss 10 -i "$MP4" -vframes 10 -vf cropdetect -f null - || true
    fi
    echo "--- Processing $MP4 with crop=$CROP"
    ffmpeg -i "$MP4" -ss $SKIP -vf "crop=$CROP,fps=10,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 "$OUT"
done