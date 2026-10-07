// Tạo mã QR THẬT cho các câu hỏi dạng QR và kiểm chứng lại bằng cách giải mã ảnh vừa tạo.
// Chạy: npx tsx scripts/generate-qr.mts
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import QRCode from "qrcode";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(projectRoot, "public/assets/qr");

/** slug → URL thật được mã hóa trong mã QR. */
export const QR_TARGETS: Record<string, string> = {
  // --- Câu hỏi phishing đang có ---
  "payroll-vps-secure": "https://payroll-vps-secure.net/login",
  "reward-hr-bonus": "https://reward-hr-bonus.xyz/login",
  "hrsystem-portal": "https://hrsystem-portal.net/kpi-review/login",

  // --- 15 câu hỏi an toàn: chỉ dùng các hệ thống nội bộ có thật của VPS ---
  // hrm: thông tin cá nhân & thủ tục nhân sự | confluence/jira: tài liệu & công việc
  // esm: hỗ trợ người dùng | vpslearn: đào tạo | vps.com.vn: thông tin công khai
  "canteen-menu": "https://vps.com.vn/canteen/thuc-don-tuan",
  "guest-wifi": "https://confluence.vps.com.vn/it/huong-dan-wifi-khach",
  "event-checkin": "http://hrm.vps.com.vn/su-kien/townhall-q4",
  "training-survey": "https://vpslearn.vps.com.vn/khao-sat-sau-dao-tao",
  "shuttle-schedule": "https://confluence.vps.com.vn/hanh-chinh/lich-xe-dua-don",
  "parking-register": "http://hrm.vps.com.vn/dang-ky-the-xe",
  "printer-guide": "https://confluence.vps.com.vn/it/huong-dan-may-in-tang-5",
  "meeting-docs": "https://confluence.vps.com.vn/hop-ban-dieu-hanh/tai-lieu",
  "library-book": "https://confluence.vps.com.vn/thu-vien/muon-sach",
  "blood-donation": "http://hrm.vps.com.vn/phong-trao/hien-mau-2026",
  "canteen-feedback": "https://esm.vps.com.vn/gop-y-can-tin",
  "device-warranty": "https://esm.vps.com.vn/tra-cuu-bao-hanh",
  "office-map": "https://vps.com.vn/van-phong/so-do-tang",
  "visitor-register": "http://hrm.vps.com.vn/dang-ky-khach",
  "health-check": "http://hrm.vps.com.vn/kham-suc-khoe-dinh-ky",
};

async function main() {
  mkdirSync(outputDir, { recursive: true });
  const report: Array<{ slug: string; file: string; url: string; giaiMa: string; khop: boolean; kb: string }> = [];

  // Tên file cố ý trung tính (qr-01, qr-02...) để người chơi không đoán được đích đến
  // khi nhìn đường dẫn ảnh; bảng ánh xạ slug -> file nằm ngay trong script này.
  const entries = Object.entries(QR_TARGETS);
  const fileNameOf = (index: number) => `qr-${String(index + 1).padStart(2, "0")}`;

  for (const [index, [slug, url]] of entries.entries()) {
    const fileName = fileNameOf(index);
    const pngBuffer = await QRCode.toBuffer(url, {
      type: "png",
      width: 512,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#111827ff", light: "#ffffffff" },
    });
    writeFileSync(resolve(outputDir, `${fileName}.png`), pngBuffer);

    // Kiểm chứng: giải mã lại đúng ảnh vừa ghi để chắc chắn người chơi quét ra đúng URL.
    const png = PNG.sync.read(pngBuffer);
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    report.push({
      slug,
      file: `${fileName}.png`,
      url,
      giaiMa: decoded?.data ?? "(không đọc được)",
      khop: decoded?.data === url,
      kb: (pngBuffer.length / 1024).toFixed(1),
    });
  }

  console.table(report);
  const failed = report.filter((row) => !row.khop);
  if (failed.length > 0) {
    console.error("Mã QR không giải mã đúng:", failed.map((row) => row.file).join(", "));
    process.exit(1);
  }
  console.log(`OK: ${report.length} mã QR đã tạo và giải mã khớp URL.`);
}

await main();
