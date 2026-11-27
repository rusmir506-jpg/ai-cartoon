#!/bin/bash
# usage: script/stills.sh frame1 frame2 ...  -> out/stills/f<frame>.png
mkdir -p out/stills
for fr in "$@"; do
  npx remotion still src/index.ts Tinkov out/stills/f$fr.png --frame=$fr --scale=0.5 --log=error >/dev/null 2>&1 || echo "fail $fr"
done
