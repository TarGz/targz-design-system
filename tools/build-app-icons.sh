#!/usr/bin/env bash
# Build an app's PNG and .icns from its 1024 icon.svg.
#
#   tools/build-app-icons.sh <icon.svg> <out.png> [out.icns] [out-window.png]
#
# The corners MUST stay transparent. An icon handed to the window system at
# runtime (eframe `with_icon`, Electron `dock.setIcon`) is shown exactly as
# given — macOS masks only the .icns in a bundle. A PNG flattened onto white
# therefore looks correct in Finder and shows white corners in the Dock.
# That is why this renders with `-background none` and never uses `qlmanage`
# or `sips`, both of which drop the alpha channel.
set -euo pipefail

USAGE="usage: build-app-icons.sh <icon.svg> <out.png> [out.icns] [out-window.png]"
SVG=${1:?$USAGE}
PNG=${2:?$USAGE}
ICNS=${3:-}
WINDOW=${4:-}
PNG_SIZE=${PNG_SIZE:-512}

# The window icon's plate, on the macOS grid: 824 inside 1024, with the shadow
# the system would have drawn. See "The window icon" at the end of this file.
BODY=824
SHADOW_DY=20
SHADOW_SIGMA=15
SHADOW_ALPHA=0.30

command -v magick >/dev/null || { echo "need ImageMagick (brew install imagemagick)" >&2; exit 1; }

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# 4x supersample off the 1024 canvas, then down to each size.
magick -background none -density 384 "$SVG" -resize 1024x1024 -depth 8 PNG32:"$TMP/master.png"

mkdir -p "$(dirname "$PNG")"
magick "$TMP/master.png" -resize "${PNG_SIZE}x${PNG_SIZE}" -depth 8 PNG32:"$PNG"
echo "wrote $PNG (${PNG_SIZE}px)"

if [ -n "$ICNS" ]; then

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

fi

# The window icon.
#
# A full-bleed icon is right for the .icns and wrong everywhere else: macOS
# insets a bundle icon to 824 of 1024 and draws its shadow, and it does
# neither to an icon handed over at runtime. Shown as-is, full-bleed art fills
# the whole slot and reads about a quarter larger than every neighbour in the
# dock. So the runtime icon carries the inset and the shadow itself.
[ -n "$WINDOW" ] || exit 0

magick -background none -density 384 "$SVG" -resize "${BODY}x${BODY}" \
  -depth 8 PNG32:"$TMP/plate.png"

magick "$TMP/plate.png" -alpha extract -background black -gravity center \
  -extent 1024x1024 -blur "0x$SHADOW_SIGMA" "$TMP/mask.png"
magick -size 1024x1024 xc:black "$TMP/mask.png" -alpha off \
  -compose copy_opacity -composite \
  -channel A -evaluate multiply "$SHADOW_ALPHA" +channel "$TMP/shadow.png"

OFF=$(( (1024 - BODY) / 2 ))
mkdir -p "$(dirname "$WINDOW")"
magick -size 1024x1024 xc:none \
  "$TMP/shadow.png" -geometry "+0+$SHADOW_DY" -composite \
  "$TMP/plate.png" -geometry "+$OFF+$OFF" -composite \
  -depth 8 PNG32:"$WINDOW"
echo "wrote $WINDOW (${BODY} plate in 1024)"
