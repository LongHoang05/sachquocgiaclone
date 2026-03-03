const fs = require("fs");
const path = require("path");

// Đường dẫn thư mục gốc (hiện tại)
const rootDir = __dirname;

// Các thư mục đích
const automationDir = path.join(rootDir, "automation_scripts");
const logsAndDocsDir = path.join(rootDir, "logs_and_docs");

// Khởi tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(automationDir)) {
  fs.mkdirSync(automationDir, { recursive: true });
}
if (!fs.existsSync(logsAndDocsDir)) {
  fs.mkdirSync(logsAndDocsDir, { recursive: true });
}

// Đọc tất cả các thành phần trong thư mục gốc
const items = fs.readdirSync(rootDir);

let scriptsMoved = 0;
let logsMoved = 0;

items.forEach((item) => {
  const itemPath = path.join(rootDir, item);

  // Chỉ xử lý file, bỏ qua thư mục (như clone-project, node_modules)
  if (!fs.statSync(itemPath).isFile()) return;

  const ext = path.extname(item).toLowerCase();

  // 1. Khu vực Bất khả xâm phạm: package.json, package-lock.json và chính file script này
  if (
    item === "package.json" ||
    item === "package-lock.json" ||
    item === "organize_workspace.js"
  ) {
    return;
  }

  // 2. Gom file Script tự động hóa (.js)
  if (ext === ".js") {
    const targetPath = path.join(automationDir, item);
    fs.renameSync(itemPath, targetPath);
    scriptsMoved++;
    return;
  }

  // 3. Gom file Báo cáo và Dữ liệu tạm (.txt, .docx, .ps1, .json)
  if ([".txt", ".docx", ".ps1", ".json"].includes(ext)) {
    const targetPath = path.join(logsAndDocsDir, item);
    fs.renameSync(itemPath, targetPath);
    logsMoved++;
    return;
  }
});

// 4. Báo cáo sau dọn dẹp
console.log("----------------------------------------------------");
console.log("BÁO CÁO DỌN DẸP KHÔNG GIAN LÀM VIỆC (WORKSPACE) CỦA BẠN");
console.log("----------------------------------------------------");
console.log(
  `- Thư mục 'automation_scripts/': Đã tiếp nhận ${scriptsMoved} file script.`,
);
console.log(
  `- Thư mục 'logs_and_docs/': Đã tiếp nhận ${logsMoved} file tài liệu/ảnh hưởng.`,
);
console.log(
  "\n✅ Hoàn tất dọn dẹp! Dự án clone-project và thư viện Node.js được bảo toàn an toàn.",
);
