#!/usr/bin/env bash
# Build an app's PNG and .icns from its 1024 icon.svg.
#
#   tools/build-app-icons.sh <icon.svg> <out.png> [out.icns]
#
# The corners MUST stay transparent. An icon handed to the window system at
# runtime (eframe `with_icon`, Electron `dock.setIcon`) is shown exactly as
# given — macOS masks only the .icns in a bundle. A PNG flattened onto white
# therefore looks correct in Finder and shows white corners in the Dock.
# That is why this renders with `-background none` and never uses `qlmanage`
# or `sips`, both of which drop the alpha channel.
set -euo pipefail

SVG=${1:?usage: build-app-icons.sh <icon.svg> <out.png> [out.icns]}
PNG=${2:?usage: build-app-icons.sh <icon.svg> <out.png> [out.icns]}
ICNS=${3:-}
PNG_SIZE=${PNG_SIZE:-512}

command -v magick >/dev/null || { echo "need ImageMagick (brew install imagemagick)" >&2; exit 1; }

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# 4x supersample off the 1024 canvas, then down to each size.
magick -background none -density 384 "$SVG" -resize 1024x1024 -depth 8 PNG32:"$TMP/master.png"

mkdir -p "$(dirname "$PNG")"
magick "$TMP/master.png" -resize "${PNG_SIZE}x${PNG_SIZE}" -depth 8 PNG32:"$PNG"
echo "wrote $PNG (${PNG_SIZE}px)"

[ -n "$ICNS" ] || exit 0

SET=$TMP/icon.iconset
mkdir -p "$SET"
for spec in 16:icon_16x16 32:icon_16x16@2x 32:icon_32x32 64:icon_32x32@2x \
            128:icon_128x128 256:icon_128x128@2x 256:icon_256x256 \
            512:icon_256x256@2x 512:icon_512x512 1024:icon_512x512@2x; do
  px=${spec%%:*}; name=${spec#*:}
  magick "$TMP/master.png" -resize "${px}x${px}" -depth 8 PNG32:"$SET/$name.png"
done

mkdir -p "$(dirname "$ICNS")"
iconutil -c icns -o "$ICNS" "$SET"
echo "wrote $ICNS"
