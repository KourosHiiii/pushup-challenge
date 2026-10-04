import ZAI from "z-ai-web-dev-sdk";
import { readFileSync, writeFileSync } from "fs";

async function main() {
  const zai = await ZAI.create();
  const input = readFileSync("/home/z/my-project/public/learn/form-hands.png");
  const dataUrl = `data:image/png;base64,${input.toString("base64")}`;

  const response = await zai.images.generations.edit({
    prompt:
      "Edit only the hand positions: move the two palms that are flat on the floor much closer to each other, directly below the chest, so that the index fingers and thumbs of the two hands touch each other and form a small diamond-shaped opening between them on the floor. This is the diamond push-up hand position. Keep the man's body, plank pose, head, clothing, colors, flat vector illustration style and pure white background exactly the same. Change nothing else.",
    images: [{ url: dataUrl }],
    size: "1024x1024",
  });

  const base64 = response?.data?.[0]?.b64_json ?? response?.data?.[0]?.base64;
  if (!base64) throw new Error("no image returned");
  writeFileSync("/home/z/my-project/public/learn/var-diamond.png", Buffer.from(base64, "base64"));
  console.log("OK edited var-diamond.png from form-hands base");
}

main().catch((e) => {
  console.error("FAIL", e?.message ?? e);
  process.exit(1);
});
