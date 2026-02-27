/**
 * Fix versioned filenames trong TẤT CẢ HTML files
 * Ví dụ: main.min.css_v_VDc6Du3GN_dpLOez2PoJrRPxJiMYKIBMWce7kZNYxRY → main.min.css
 *         site.js_v_u8ahsHJvhWhtnYdgjWI3Cut0lYtDDTDo0Sc-Ra1MKhc → site.js
 */

const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "clone-project");

// Tìm tất cả HTML files (bao gồm subfolder)
function findHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findHtmlFiles(full));
    else if (entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

function main() {
  const htmlFiles = findHtmlFiles(OUTPUT_DIR);
  console.log(`📄 ${htmlFiles.length} HTML files found\n`);

  let totalFixes = 0;

  for (const htmlPath of htmlFiles) {
    const relPath = path.relative(OUTPUT_DIR, htmlPath);
    let html = fs.readFileSync(htmlPath, "utf8");
    let fixes = 0;

    // Pattern: assets/xxx/filename.ext_v_HASH hoặc filename.ext_v_HASH
    // Strip _v_HASH phần (hash có thể là alphanumeric + dashes)
    // Regex: match .css hoặc .js hoặc .png etc followed by _v_ and hash chars
    const versionedRegex =
      /(\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf))(_v_[\w\-]+)/g;

    let match;
    const replacements = new Set();
    while ((match = versionedRegex.exec(html)) !== null) {
      replacements.add(match[3]); // _v_HASH part
    }

    for (const hashSuffix of replacements) {
      const count = html.split(hashSuffix).length - 1;
      html = html.split(hashSuffix).join("");
      fixes += count;
    }

    // Pattern 2: filename có _N suffix do downloadAsset counter
    // Ví dụ: bootstrap.min_4.css → bootstrap.min.css
    // Chỉ sửa nếu file gốc tồn tại
    const suffixRegex = /(assets\/\w+\/[\w\.\-]+?)_(\d+)\.(css|js)/g;
    let m2;
    const suffixReplacements = new Map();
    while ((m2 = suffixRegex.exec(html)) !== null) {
      const withSuffix = m2[0]; // assets/css/bootstrap.min_4.css
      const without = `${m2[1]}.${m2[3]}`; // assets/css/bootstrap.min.css
      // Kiểm tra file gốc tồn tại
      const origFile = path.join(OUTPUT_DIR, without);
      if (fs.existsSync(origFile) && !suffixReplacements.has(withSuffix)) {
        suffixReplacements.set(withSuffix, without);
      }
    }

    for (const [from, to] of suffixReplacements) {
      const count = html.split(from).length - 1;
      html = html.split(from).join(to);
      fixes += count;
    }

    if (fixes > 0) {
      fs.writeFileSync(htmlPath, html, "utf8");
      console.log(`  ✓ ${relPath}: ${fixes} fixes`);
      totalFixes += fixes;
    } else {
      console.log(`  - ${relPath}: ok`);
    }
  }

  console.log(
    `\n✅ Total: ${totalFixes} fixes across ${htmlFiles.length} files`,
  );
}

main();
