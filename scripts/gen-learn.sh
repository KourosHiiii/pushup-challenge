#!/bin/bash
# تصاویر تب آموزش — فرم‌های دقیق شنا (نمای نیم‌رخ، فرم صحیح)
set -e
OUT=/home/z/my-project/public/learn
mkdir -p "$OUT"

STYLE="clean modern flat vector illustration for a fitness education app, athletic man with short dark hair wearing a gray t-shirt and dark shorts, side profile view, accurate human anatomy and proportions, perfect push-up form, plain pure white background, no text, no labels, no watermark, no arrows"

gen () {
  local name="$1"; local prompt="$2"
  if [ -s "$OUT/$name.png" ]; then echo "skip $name (exists)"; return; fi
  echo "── generating $name ..."
  z-ai image -p "$prompt, $STYLE" -o "$OUT/$name.png" -s 1024x1024 >/dev/null 2>&1 \
    && echo "   OK $name" || echo "   FAIL $name"
}

# درس ۲: عضلات درگیر — بدن ایستاده با هایلایت عضلانی
gen "anatomy" "educational fitness anatomy diagram, fit athletic man standing facing forward with arms slightly away from body, body shown as smooth light gray silhouette, chest pectoral muscles glowing in red-orange, upper arms triceps glowing orange, front shoulders glowing orange, abdominal core muscles glowing soft yellow, clean medical illustration style, accurate anatomy, front view, symmetrical"

# درس ۳: فرم صحیح گام‌به‌گام
gen "form-start" "side view of a man holding the starting top position of a push-up on the floor, perfectly straight rigid plank line from head through hips to heels, arms fully extended straight down, palms flat on the floor shoulder-width apart, neutral neck looking down, core tight, heels together"
gen "form-down" "side view of a man at the bottom position of a push-up, chest a few centimeters above the floor, elbows bent at 45 degrees and kept close to the torso pointing backward, body still a perfectly straight rigid line from head to heels, neutral neck"
gen "form-hands" "top-down view looking at a man in push-up top position on a floor mat, two palms flat on the floor slightly wider than shoulder width, fingers pointing forward, body forming a straight vertical plank seen from above, head facing down"

# درس ۵: انواع شنا
gen "var-knee" "side view of a man doing a knee push-up on the floor, knees resting on the floor, lower legs lifted up and crossed in the air, straight line from head through hips to knees, arms fully extended supporting the body, beginner variation"
gen "var-incline" "side view of a man doing an incline push-up with both palms on a stable low workout bench, body forming a straight diagonal line from head to heels, arms fully extended, feet on the floor, easier variation"
gen "var-wide" "side view of a man doing a wide-grip push-up in top position, both palms placed much wider than shoulder width on the floor, perfectly straight plank, arms extended, emphasis on chest muscles"
gen "var-diamond" "side view of a man doing a diamond push-up in top position, both hands close together under the chest with index fingers and thumbs touching to form a triangle shape, elbows tucked close to the body, straight plank, advanced variation"
gen "var-decline" "side view of a man doing a decline push-up with both feet elevated on a workout bench and palms on the floor, body forming a straight diagonal line with hips at the top, arms fully extended, advanced variation"

echo "DONE learn"; ls -la "$OUT"
