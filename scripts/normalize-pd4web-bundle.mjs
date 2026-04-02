import fs from "node:fs";
import path from "node:path";

const bundleDirs = process.argv.slice(2);

if (bundleDirs.length === 0) {
  console.error(
    "Usage: npm run normalize:pd4web -- <public/bundle-folder> [...]",
  );
  process.exit(1);
}

const replacements = [
  {
    from: 'audioWorklet.addModule("pd4web.aw.js")',
    to: 'audioWorklet.addModule(locateFile("pd4web.aw.js"))',
  },
  {
    from: '.addModule("/pd4web/pd4web.aw.js")',
    to: '.addModule(locateFile("pd4web.aw.js"))',
  },
];

for (const bundleDir of bundleDirs) {
  const runtimePath = path.join(bundleDir, "pd4web.js");

  if (!fs.existsSync(runtimePath)) {
    console.error(`Missing runtime: ${runtimePath}`);
    process.exitCode = 1;
    continue;
  }

  const source = fs.readFileSync(runtimePath, "utf8");
  let updated = source;

  for (const replacement of replacements) {
    updated = updated.replaceAll(replacement.from, replacement.to);
  }

  if (updated === source) {
    console.warn(`No normalization changes applied: ${runtimePath}`);
    continue;
  }

  fs.writeFileSync(runtimePath, updated);
  console.log(`Normalized: ${runtimePath}`);
}
