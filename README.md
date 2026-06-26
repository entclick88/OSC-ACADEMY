# OSC ACADEMY

Portfolio Academy System — Google Apps Script web app สำหรับบันทึกและติดตามการเรียนการสอน

- Sheet ข้อมูล: https://docs.google.com/spreadsheets/d/1q7_Z8njO8kzW9U1TPjExYY-j_v5UIScvWNxJsvOgbcA/edit
- ไฟล์หลัก: `Code.gs` (server logic), `Index.html` (UI), `appsscript.json` (manifest)

## วิธี sync กับ Google Apps Script ด้วย clasp

1. ติดตั้ง clasp (ครั้งเดียว):
   ```
   npm install -g @google/clasp
   clasp login
   ```
2. ผูกโฟลเดอร์นี้กับ Apps Script project ที่มีอยู่แล้ว (ใช้ Script ID จาก Apps Script editor > Project Settings):
   ```
   clasp clone <SCRIPT_ID>
   ```
   หรือถ้าต้องการสร้างโปรเจกต์ใหม่:
   ```
   clasp create --type webapp --title "OSC ACADEMY"
   ```
3. หลังแก้ไขโค้ดในเครื่อง ให้ push ขึ้น Apps Script:
   ```
   clasp push
   ```
4. Deploy เป็น Web App:
   ```
   clasp deploy
   ```

`.clasp.json` (มี scriptId เฉพาะของแต่ละคน) ถูก ignore ไว้ใน git — ต้องสร้างเองตอน clone/create ครั้งแรก
