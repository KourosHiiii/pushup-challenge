#!/bin/bash
# تلاش دوم برای دو تصویر سخت: diamond و decline
set -e
OUT=/home/z/my-project/public/learn

STYLE="educational sports textbook illustration, biomechanically correct exercise demonstration, clean modern flat vector style, athletic man with short dark hair wearing a gray t-shirt and dark shorts, accurate human anatomy, perfect strict form, plain pure white background, no text, no labels, no watermark"

gen () {
  local name="$1"; local prompt="$2"
  echo "── regenerating $name ..."
  rm -f "$OUT/$name.png"
  z-ai image -p "$prompt, $STYLE" -o "$OUT/$name.png" -s 1024x1024 >/dev/null 2>&1 \
    && echo "   OK $name" || echo "   FAIL $name"
}

gen "var-diamond" "front view from slightly above of a man in the top plank position of a push-up facing the floor, his two hands are placed close together in the exact center under his chest, thumbs and index fingers of the two hands touching to form a small diamond shape between them, both feet on toes behind, body perfectly straight, elbows tucked against his ribs, advanced close-grip push-up"

gen "var-decline" "side view of a man doing a decline push-up: his FEET ARE PROPPED UP HIGH ON A GYM BENCH while HIS HANDS ARE DOWN ON THE FLOOR. The bench is on the right side of the image with his calves and feet resting on top of it, the floor supports his palms and his head on the left side which is lower than his hips. His body is a straight diagonal board going downhill from the high feet on the bench to the low head on the floor, arms fully extended straight, advanced variation"

echo "DONE fix2"
