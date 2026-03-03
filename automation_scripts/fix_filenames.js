/**
 * Fix versioned CSS/JS filenames: rename them to clean names
 * and update all HTML references
 */

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const OUTPUT_DIR = path.join(__dirname, "clone-project");
const CSS_DIR = path.join(OUTPUT_DIR, "assets", "css");
const JS_DIR = path.join(OUTPUT_DIR, "assets", "js");

// Rename files: remove everything after .css or .js in filename
function cleanFilename(filename) {
  // e.g. "main.min.css_v_VDc6Du3GN..." → "main.min.css"
  // e.g. "site.js_v_u8ahsHJvhWh..." → "site.js"
  const cssMatch = filename.match(/^(.*\.css)/);
  if (cssMatch) return cssMatch[1];
  const jsMatch = filename.match(/^(.*\.js)/);
  if (jsMatch) return jsMatch[1];
  const woff2Match = filename.match(/^(.*\.woff2)/);
  if (woff2Match) return woff2Match[1];
  const woffMatch = filename.match(/^(.*\.woff)/);
  if (woffMatch) return woffMatch[1];
  const ttfMatch = filename.match(/^(.*\.ttf)/);
  if (ttfMatch) return ttfMatch[1];
  return filename; // unchanged
}

// Build rename map for a directory
function buildRenameMap(dir) {
  const renames = new Map(); // old name → new name
  const files = fs.readdirSync(dir);
  const newNames = new Set();

  for (const file of files) {
    const newName = cleanFilename(file);
    if (newName !== file) {
      // Handle collision: if newName already taken, add suffix
      let finalName = newName;
      let i = 1;
      while (newNames.has(finalName)) {
        const ext = path.extname(newName);
        const base = newName.slice(0, newName.length - ext.length);
        finalName = `${base}_${i}${ext}`;
        i++;
      }
      newNames.add(finalName);
      renames.set(file, finalName);
    } else {
      newNames.add(file);
    }
  }
  return renames;
}

function applyRenames(dir, renames) {
  for (const [oldName, newName] of renames) {
    const oldPath = path.join(dir, oldName);
    const newPath = path.join(dir, newName);
    if (!fs.existsSync(newPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`  Renamed: ${oldName} → ${newName}`);
    }
  }
}

// Build overall replacement map for HTML (relative paths)
function buildPathReplaceMap(subdir, renames) {
  const map = new Map();
  for (const [oldName, newName] of renames) {
    map.set(`assets/${subdir}/${oldName}`, `assets/${subdir}/${newName}`);
  }
  return map;
}

// Rename files
console.log("Renaming CSS files...");
const cssRenames = buildRenameMap(CSS_DIR);
applyRenames(CSS_DIR, cssRenames);

console.log("\nRenaming JS files...");
const jsRenames = buildRenameMap(JS_DIR);
applyRenames(JS_DIR, jsRenames);

// Build combined path replace map
const allReplaces = new Map([
  ...buildPathReplaceMap("css", cssRenames),
  ...buildPathReplaceMap("js", jsRenames),
]);

if (allReplaces.size === 0) {
  console.log("\nNo renames needed in HTML files.");
  process.exit(0);
}

// Update HTML files
const htmlFiles = fs
  .readdirSync(OUTPUT_DIR)
  .filter((f) => f.endsWith(".html"))
  .map((f) => path.join(OUTPUT_DIR, f));

for (const htmlFile of htmlFiles) {
  let content = fs.readFileSync(htmlFile, "utf8");
  let changed = false;
  for (const [oldPath, newPath] of allReplaces) {
    if (content.includes(oldPath)) {
      content = content.split(oldPath).join(newPath);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(htmlFile, content, "utf8");
    console.log(`✓ Updated: ${path.basename(htmlFile)}`);
  }
}

// Also update CSS files (they may reference each other or JS)
const cssFiles = fs.readdirSync(CSS_DIR).map((f) => path.join(CSS_DIR, f));
for (const cssFile of cssFiles) {
  let content = fs.readFileSync(cssFile, "utf8");
  let changed = false;
  for (const [oldPath, newPath] of allReplaces) {
    const oldBasename = oldPath.split("/").pop();
    const newBasename = newPath.split("/").pop();
    if (content.includes(oldBasename)) {
      content = content.split(oldBasename).join(newBasename);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(cssFile, content, "utf8");
    console.log(`✓ Updated CSS: ${path.basename(cssFile)}`);
  }
}

console.log("\n✅ Cleanup complete!");
