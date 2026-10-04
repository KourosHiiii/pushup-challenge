#!/bin/bash
# Generate all app images with AI — precise prompts, consistent character
cd /home/z/my-project

CHAR="young athletic Middle Eastern man with short dark hair and light beard, wearing a plain gray t-shirt and black athletic shorts"
STYLE="professional fitness photography, sharp focus, clean dark charcoal studio background with warm orange rim lighting"

gen() {
  local out="$1"; local prompt="$2"
  if [ -s "public/$out" ]; then echo "SKIP $out (exists)"; return; fi
  echo "GEN $out ..."
  z-ai image -p "$prompt" -o "public/$out" > /dev/null 2>&1
  if [ -s "public/$out" ]; then echo "OK  $out"; else echo "FAIL $out"; fi
}

# ── فرم صحیح: ۳ مرحله ──
gen "learn/form-start.png" "$CHAR in the high plank push-up START position, perfect side full-body view, arms fully extended straight, hands slightly wider than shoulders directly under them, body forming one perfectly straight rigid line from head to heels, neutral neck looking slightly down at floor, toes tucked, on a dark gym floor, $STYLE"
gen "learn/form-mid.png" "$CHAR in push-up HALF-WAY-DOWN position, perfect side full-body view, elbows bent at about 45 degrees relative to torso and kept close to the body, body still one perfectly straight rigid line from head to heels, lowering with control, on a dark gym floor, $STYLE"
gen "learn/form-bottom.png" "$CHAR in push-up BOTTOM position, perfect side full-body view, chest a few centimeters above the floor, elbows bent about 45 degrees close to the torso, body one perfectly straight rigid line from head to heels, core tight, on a dark gym floor, $STYLE"

# ── اشتباهات رایج (عمداً فرم غلط) ──
gen "learn/mistake-hips.png" "$CHAR doing a push-up with INCORRECT BAD FORM: hips sagging noticeably down toward the floor, lower back over-arched, belly dipping down, head looking up, perfect side full-body view, on a dark gym floor, $STYLE"
gen "learn/mistake-elbows.png" "$CHAR doing a push-up with INCORRECT BAD FORM: elbows flared out wide almost 90 degrees away from the torso in a T shape, three-quarter front elevated view showing elbows pointing sideways, hands very wide, $STYLE"
gen "learn/mistake-halfrep.png" "$CHAR doing a push-up with INCORRECT BAD FORM: lazy partial range of motion, elbows bent only slightly a few centimeters, body barely lowered and far from the floor, perfect side full-body view, on a dark gym floor, $STYLE"

# ── آناتومی ──
gen "learn/anatomy.png" "Modern anatomy fitness infographic illustration: muscular human figure in push-up plank position, perfect side view, dark navy blue background, glowing bright orange highlighted muscle groups: pectoral chest muscles, triceps back of arms, front deltoid shoulders, and abdominal core, clean minimal vector style, dramatic glow, no text no labels"

# ── انواع شنا ──
gen "learn/var-knee.png" "$CHAR doing KNEE PUSH-UPS for beginners: resting on both knees on a mat, knees bent on the floor, body one straight line from head to knees, perfect side full-body view, $STYLE"
gen "learn/var-incline.png" "$CHAR doing INCLINE PUSH-UPS: hands placed on a sturdy flat gym bench elevated about knee height, body angled straight down from shoulders to feet, plank position, perfect side full-body view, $STYLE"
gen "learn/var-wide.png" "$CHAR doing WIDE-GRIP PUSH-UPS: hands placed on the floor much wider than shoulder width, bottom position with chest low, perfect side full-body view, $STYLE"
gen "learn/var-diamond.png" "$CHAR doing DIAMOND PUSH-UPS: hands close together directly under the chest forming a triangle diamond shape with thumbs and index fingers, elbows tucked tight against the ribs, top position, three-quarter front view, $STYLE"
gen "learn/var-decline.png" "$CHAR doing DECLINE PUSH-UPS: feet elevated on a sturdy flat gym bench, hands on the floor, body angled with hips up and head lower than feet, straight rigid body, perfect side full-body view, $STYLE"

# ── پس‌زمینه کارت اشتراک (بدنسازی سینمایی) ──
gen "images/share-bg.png" "Epic dramatic dark bodybuilding gym background, empty industrial gym at night with heavy barbells weight plates and dumbbell rack silhouettes, intense orange amber cinematic spotlight from above cutting through smoke haze, deep black vignette on all edges, large clean darker empty area in the center for text overlay, no people, moody powerful atmosphere, vertical composition"

echo "ALL DONE"
