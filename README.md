# OSC ACADEMY

Portfolio Academy System — ระบบบันทึกและติดตามการเรียนการสอน

- Sheet ข้อมูล: https://docs.google.com/spreadsheets/d/1q7_Z8njO8kzW9U1TPjExYY-j_v5UIScvWNxJsvOgbcA/edit

## สถาปัตยกรรม

- **`Code.gs`** — รันบน Google Apps Script เป็น JSON API (ผ่าน `doGet`/`doPost`) ต้อง import เข้า Apps Script editor ด้วยตนเอง (copy-paste) แล้ว Deploy เป็น Web App
- **`index.html`** — หน้าเว็บ UI โฮสต์อยู่บน **GitHub Pages** เรียกข้อมูลจาก Apps Script Web App ผ่าน `fetch()` (ไม่ใช้ `google.script.run` เพราะใช้ได้แค่ตอน HTML ถูก serve จาก Apps Script เท่านั้น)

## วิธี deploy

1. **ฝั่ง Apps Script**:
   - เปิด Apps Script editor ของโปรเจกต์ Portfolio Academy System
   - คัดลอกเนื้อหา `Code.gs` จาก repo นี้ไปแทนที่ของเดิมในตัว editor
   - Deploy > Manage deployments > New deployment > Web app (Execute as: Me, Who has access: Anyone) > คัดลอก URL ที่ลงท้ายด้วย `/exec`

2. **ฝั่ง GitHub Pages**:
   - เปิด `index.html` ในนี้ แก้ค่า `const API_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_EXEC_URL_HERE";` ให้เป็น URL `/exec` ที่ได้จากขั้นตอนที่ 1
   - เปิด GitHub Pages ที่ Settings > Pages > Source: `master` branch, root `/`
   - เว็บจะรันที่ `https://entclick88.github.io/OSC-ACADEMY/`

3. ถ้าแก้ `Code.gs` ในอนาคต ต้อง copy-paste เข้า Apps Script editor ใหม่ทุกครั้ง แล้ว Deploy ใหม่ (แก้แค่ฝั่ง GitHub ไม่มีผลกับเว็บแอปที่รันจริง)

หมายเหตุ: ลองใช้ `clasp` เพื่อ push โค้ดอัตโนมัติแล้ว แต่ติดปัญหาฝั่ง Google (OAuth client เดิมของ clasp ถูกบล็อก และ client ที่สร้างเองก็โดน policy "doesn't comply with Google's OAuth 2.0 policy" แม้เพิ่ม PKCE แล้ว) จึงใช้วิธี manual sync ไปก่อน
