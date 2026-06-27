# OSC ACADEMY

Portfolio Academy System — Google Apps Script web app สำหรับบันทึกและติดตามการเรียนการสอน

- Sheet ข้อมูล: https://docs.google.com/spreadsheets/d/1q7_Z8njO8kzW9U1TPjExYY-j_v5UIScvWNxJsvOgbcA/edit
- ไฟล์หลัก: `Code.gs` (server logic), `Index.html` (UI), `appsscript.json` (manifest)

## วิธี sync กับ Google Apps Script (manual)

GitHub repo นี้เป็นที่เก็บโค้ดหลัก (source of truth) ส่วน Apps Script editor เป็นที่รันจริง — sync กันด้วยการ copy-paste

1. แก้ไขโค้ดใน repo นี้ (`Code.gs`, `Index.html`, `appsscript.json`) แล้ว commit/push ขึ้น GitHub ตามปกติ
2. เปิด Apps Script editor ของโปรเจกต์ Portfolio Academy System
3. คัดลอกเนื้อหาไฟล์ที่แก้ไขจาก repo นี้ ไปแทนที่ไฟล์เดิมในตัว editor (`Code.gs` → `Code.gs`, `Index.html` → `Index`)
4. กด Save แล้ว Deploy > Manage deployments > New deployment (หรือแก้ deployment เดิม) เพื่ออัปเดตเว็บแอป

หมายเหตุ: ลองใช้ `clasp` เพื่อ sync อัตโนมัติแล้ว แต่ OAuth client ที่ฝังมาใน clasp ถูก Google ปิดใช้งานเนื่องจากไม่รองรับ PKCE ตามนโยบายความปลอดภัยล่าสุด ถ้าต้องการ sync อัตโนมัติในอนาคต ต้องสร้าง OAuth client ของตัวเองผ่าน Google Cloud Console แล้วใช้ `clasp login --creds <credentials.json>`
