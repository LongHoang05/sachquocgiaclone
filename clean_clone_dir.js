const fs = require("fs");
const path = require("path");

// Thư mục gốc cần dọn dẹp
const targetDir = path.join(__dirname, "clone-project");
// Thư mục cấm đụng (SAFE ZONE)
const ignoredDirName = "assets";
// Định dạng file mục tiêu (TARGETS)
const targetExtensions = [".js", ".txt", ".json"];

let deletedFilesCount = 0;
const deletedFilesList = [];

function cleanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`[CẢNH BÁO] Thư mục không tồn tại: ${dirPath}`);
    return;
  }

  // Đọc toàn bộ nội dung trong thư mục
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      // SAFE ZONE 1: Tuyệt đối bỏ qua thư mục assets/ (kể cả quét hay xóa)
      if (item === ignoredDirName) {
        continue;
      }
      // Đệ quy quét các thư mục con khác
      cleanDirectory(itemPath);
    } else if (stats.isFile()) {
      const ext = path.extname(item).toLowerCase();

      // TARGETS 2: Phát hiện file có đuôi .js, .txt, .json
      if (targetExtensions.includes(ext)) {
        try {
          // Tiêu diệt file rác ngay lập tức
          fs.unlinkSync(itemPath);
          deletedFilesList.push(itemPath);
          deletedFilesCount++;
        } catch (err) {
          console.error(`[LỖI] Không thể xóa file: ${itemPath}`, err);
        }
      }
      // Mặc định bỏ qua các file khác mang đuôi .html, .png, .ico... (đảm bảo SAFE ZONE)
    }
  }
}

console.log("----------------------------------------------------");
console.log("BẮT ĐẦU QUÉT VÀ TIÊU DIỆT RÁC TRONG CLONE-PROJECT");
console.log("----------------------------------------------------");

// Kích hoạt dọn dẹp
cleanDirectory(targetDir);

// 3. Báo cáo Console
if (deletedFilesCount > 0) {
  console.log("DANH SÁCH CÁC FILE ĐÃ BỊ XÓA (fs.unlinkSync):");
  deletedFilesList.forEach((file) => {
    // Rút gọn đường dẫn để log nhìn dễ hơn
    const relativePath = path.relative(__dirname, file);
    console.log(` 🗑️  ${relativePath}`);
  });
} else {
  console.log("Không tìm thấy tệp tin rác nào vi phạm.");
}

console.log("\n----------------------------------------------------");
console.log(
  `✅ TỔNG KẾT: Đã dọn dẹp thành công ${deletedFilesCount} file rác!`,
);
console.log(
  "🔒 Khu vực SAFE ZONE (thư mục assets/, file .html, hình ảnh) đã được bảo vệ tuyệt đối.",
);
