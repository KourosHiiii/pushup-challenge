#!/bin/bash
# تولید ۷ مرحله ماسکات شعله — استایل یکسان در همه
set -e
OUT=/home/z/my-project/public/mascot
mkdir -p "$OUT"

STYLE="cute cartoon flame mascot character for a fitness app, kawaii style, flame body made of smooth orange amber and golden gradient fire, big round expressive dark brown eyes with white highlights, soft rounded shapes, flat vector illustration, subtle soft shading, centered composition, plain pure white background, no text, no watermark, no extra limbs"

gen () {
  local name="$1"; local prompt="$2"
  if [ -s "$OUT/$name.png" ]; then echo "skip $name (exists)"; return; fi
  echo "── generating $name ..."
  z-ai image -p "$prompt, $STYLE" -o "$OUT/$name.png" -s 1024x1024 >/dev/null 2>&1 \
    && echo "   OK $name" || echo "   FAIL $name"
}

gen "spark"     "very tiny baby spark of fire, small teardrop-shaped ember with the same cute eyes, soft orange glow, minimal"
gen "flame-baby" "small cute flame with a little rounded tip on top, cheerful open smile, joyful"
gen "flame-warrior" "medium sized flame character with determined confident expression, one small flexing arm made of fire"
gen "flame-hero" "proud heroic flame character wearing a small flowing red superhero cape, confident smile"
gen "flame-legend" "large majestic flame character wearing a small golden crown sitting on top of the flame tip, royal confident smile"
gen "flame-inferno" "epic large flame character surrounded by small floating fire particles and golden sparks, powerful excited expression, radiant aura"
gen "flame-sad" "sad droopy flame character, drooping flame tip bent to one side, teary big eyes looking down, frowning sad mouth, pale desaturated orange colors, small"

echo "DONE mascots"; ls -la "$OUT"
