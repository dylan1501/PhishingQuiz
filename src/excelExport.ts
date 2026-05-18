function escapeHtml(value: string | number) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getTimestamp() {
  const timestamp = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${timestamp.getFullYear()}${pad(timestamp.getMonth() + 1)}${pad(timestamp.getDate())} - ${pad(timestamp.getHours())}${pad(timestamp.getMinutes())}${pad(timestamp.getSeconds())}`;
}

export function exportTableToExcel(
  filenamePrefix: string,
  headers: string[],
  rows: Array<Array<string | number>>,
) {
  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const bodyHtml = rows
    .map(
      (row) => `
        <tr>
          ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}
        </tr>
      `,
    )
    .join("");
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8" />
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
          th, td { border: 1px solid #9ca3af; padding: 8px 10px; text-align: left; }
          th { background: #dbeafe; font-weight: 700; }
        </style>
      </head>
      <body>
        <table>
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </body>
    </html>
  `;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenamePrefix} - ${getTimestamp()}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}
