#!/bin/sh
# Convert an SVG icon to PNG using the first working rasterizer (macOS / Linux).
set -eu

usage() {
	echo "usage: $0 input.svg [output.png] [size]" >&2
	exit 1
}

[ $# -ge 1 ] || usage

in="$1"
out="${2:-${in%.svg}.png}"
size="${3:-24}"

if command -v rsvg-convert >/dev/null 2>&1; then
	rsvg-convert -w "$size" -h "$size" -o "$out" "$in"
elif command -v sharp >/dev/null 2>&1; then
	sharp -i "$in" -o "$(dirname "$out")" -f png resize "$size" "$size"
elif inkscape --version >/dev/null 2>&1; then
	inkscape "$in" --export-type=png --export-filename="$out" --export-width="$size"
elif command -v magick >/dev/null 2>&1; then
	magick "$in" -background none -resize "${size}x${size}" "$out"
elif command -v convert >/dev/null 2>&1; then
	convert "$in" -background none -resize "${size}x${size}" "$out"
elif command -v npx >/dev/null 2>&1; then
	dir="$(dirname "$out")"
	npx --yes sharp-cli -i "$in" -o "$dir" -f png resize "$size" "$size"
	generated="$dir/$(basename "${in%.svg}").png"
	[ "$generated" = "$out" ] || mv "$generated" "$out"
else
	echo "no SVG rasterizer found (tried rsvg-convert, sharp, inkscape, magick, convert, npx sharp-cli)" >&2
	exit 1
fi

echo "wrote $out (${size}px)"
