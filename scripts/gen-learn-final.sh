#!/bin/bash
# تکمیل تصاویر گمشده تب آموزش
set -e
OUT=/home/z/my-project/public/learn

STYLE="educational sports textbook illustration, biomechanically correct exercise demonstration, clean modern flat vector style, athletic man with short dark hair wearing a gray t-shirt and dark shorts, side profile view, accurate human anatomy and proportions, plain pure white background, no text, no labels, no watermark"

gen () {
  local name="$1"; local prompt="$2"
  if [ -s "$OUT/$name.png" ]; then echo "skip $name (exists)"; return; fi
  echo "── generating $name ..."
  z-ai image -p "$prompt, $STYLE" -o "$OUT/$name.png" -s 1024x1024 >/dev/null 2>&1 \
    && echo "   OK $name" || echo "   FAIL $name"
}

# فاز پایین‌ترین نقطه — سینه نزدیک زمین
gen "form-bottom" "side view of a man at the very bottom position of a push-up, his chest is only a few centimeters above the floor, both elbows bent at 45 degrees and kept close to the back of his torso pointing backward, his body remains one perfectly straight rigid line from head through hips to heels with hips level and core tight, neutral neck looking down at the floor"

# تصویر اشتباه ۱: شکم افتاده (عمداً اشتباه واضح)
gen "mistake-hips" "side view of a man doing a push-up with an exaggerated FORM MISTAKE: his belly and hip area sag down toward the floor, the middle of his body hangs clearly below the straight line between his shoulders and his ankles, lower back arched and drooping, while his shoulders and heels stay up. The drooping hips are the clear focal point of the illustration"

# تصویر اشتباه ۲: آرنج‌های کاملاً باز
gen "mistake-elbows" "top-down view of a man doing a push-up with an exaggerated FORM MISTAKE: both elbows flared fully out to the sides at 90 degrees from his torso, forming a T shape with his upper body, shoulders pushed wide toward the ears. The wide open elbows pointing sideways are the clear focal point"

# تصویر اشتباه ۳: نیمه رِپ
gen "mistake-halfrep" "side view of a man doing a push-up with an exaggerated FORM MISTAKE: he only dips down a tiny amount, his elbows bend very slightly and his chest stays very far high above the floor, showing a shallow incomplete repetition. The tiny shallow dip with chest far from the floor is the clear focal point"

echo "DONE missing"; ls -la "$OUT"
