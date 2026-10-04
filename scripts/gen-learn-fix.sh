#!/bin/bash
# بازتولید تصاویر اشتباه تب آموزش با هندسه صریح‌تر
set -e
OUT=/home/z/my-project/public/learn

STYLE="educational sports textbook illustration, biomechanically correct exercise demonstration, clean modern flat vector style, athletic man with short dark hair wearing a gray t-shirt and dark shorts, accurate human anatomy and proportions, perfect strict exercise form, plain pure white background, no text, no labels, no watermark"

gen () {
  local name="$1"; local prompt="$2"
  echo "── regenerating $name ..."
  rm -f "$OUT/$name.png"
  z-ai image -p "$prompt, $STYLE" -o "$OUT/$name.png" -s 1024x1024 >/dev/null 2>&1 \
    && echo "   OK $name" || echo "   FAIL $name"
}

gen "form-start" "side view of a man holding the TOP position of a push-up, his body is one perfectly straight rigid board from head to heels, shoulders exactly above the wrists, hips exactly level in line between shoulders and heels with no sagging and no piking, both arms fully extended straight like pillars, palms flat on the floor, toes tucked on the floor, neutral neck"

gen "var-knee" "side view of a man doing a beginner kneeling push-up top position, BOTH KNEES RESTING ON THE FLOOR, shins and feet lifted off the floor behind him pointing up, his body is one straight rigid line from head through hips to the knees, arms fully extended straight with palms flat on the floor, shoulders above wrists, modified easy push-up variation"

gen "var-incline" "side view of a man doing an incline push-up top position, BOTH PALMS FLAT ON A LOW STABLE WORKOUT BENCH in front of him, arms fully extended straight like pillars with shoulders exactly above wrists on the bench, feet flat on the floor behind him, his body is one perfectly straight diagonal board from head to heels, hips in line with no sagging, easier beginner variation"

gen "var-wide" "side view of a man doing a wide-grip push-up top position, BOTH PALMS FLAT ON THE FLOOR placed very wide apart, clearly much wider than shoulder width, arms fully extended straight, body one perfectly straight rigid plank from head to heels, shoulders above wrists, chest focused variation"

gen "var-diamond" "three-quarter front view of a man in the top position of a diamond push-up, BOTH HANDS TOGETHER DIRECTLY UNDER HIS CHEST with index fingers and thumbs of both hands touching each other forming a clear triangle diamond shape between them, arms fully extended, body one straight rigid plank from head to heels on toes, elbows tucked, advanced triceps variation"

gen "var-decline" "side view of a man doing a decline push-up top position, BOTH FEET RESTING ON TOP OF A WORKOUT BENCH BEHIND HIM and BOTH PALMS FLAT ON THE FLOOR in front of him, his hips are the highest point of a perfectly straight diagonal body line going down from feet on the bench to head, arms fully extended straight, shoulders above wrists, advanced variation"

echo "DONE fix"; ls -la "$OUT"
