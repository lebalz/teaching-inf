#!/usr/bin/env bash

# convert a series of jpgs-images to mp4 - the images should be named 
# in a way that they are sorted in the correct order when sorted
# alphabetically
set -e

usage="usage: ./jpgs2mp4.sh path/to/images"

VID=$1
# out file should be named like path/to/images/images.mp4
OUT="${VID%/}/$(basename ${VID%/}).mp4"

# glob pattern for the jpgs and jpegs - assumes they are in the same folder and named in a way that they are sorted in the correct order when sorted alphabetically
JPGS="${VID%/}/*.jpg"

ffmpeg -framerate 30 -pattern_type glob -i $JPGS  -c:v libx264 -pix_fmt yuv420p $OUT