const SS_ID = '1q7_Z8njO8kzW9U1TPjExYY-j_v5UIScvWNxJsvOgbcA';
const FOLDER_ID = '1qAGBVRW4P5WF6gi20z96GfaDyJJ5fFuk';

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Portfolio Academy System')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// 1. คำนวณยอดสอนสะสมเดือนนี้
function getMonthlyHours(teacherName) {
  try {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName('Rec_Time_T');
    if (!sheet) return "0.00";
    const data = sheet.getDataRange().getValues();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let total = 0;

    for (let i = 1; i < data.length; i++) {
      let rowDateValue = data[i][0];
      let rowTeacher = data[i][1] ? data[i][1].toString().trim() : "";
      let hours = parseFloat(data[i][6]) || 0;

      let rowDate = (rowDateValue instanceof Date) ? rowDateValue : null;
      if (!rowDate && rowDateValue) {
        let parts = rowDateValue.toString().split(' ')[0].split('/');
        if (parts.length === 3) rowDate = new Date(parts[2], parts[1] - 1, parts[0]);
      }
      if (rowDate && rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear) {
        if (teacherName === "admin" || rowTeacher === teacherName) total += hours;
      }
    }
    return total.toFixed(2);
  } catch (e) { return "0.00"; }
}

// 2. ดึงข้อมูลล่าสุด
function getLatestInfo(n, c) {
  try {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName('Rec');
    const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    const colIdx = headers.indexOf(`${n} (${c})`) + 1;
    if (colIdx === 0) return { teacher: "", time: 0, lessonNote: "", imgUrl: "" };

    const colData = sheet.getRange(1, colIdx, 8, 1).getValues();
    return {
      teacher: colData[2][0] ? colData[2][0].toString() : "",
      time: parseFloat(colData[3][0].toString().replace(/[^0-9.]/g, "")) || 0,
      lessonNote: colData[5][0] ? colData[5][0].toString() : "",
      imgUrl: colData[7][0] ? colData[7][0].toString() : ""
    };
  } catch(e) { return { teacher: "", time: 0, lessonNote: "", imgUrl: "" }; }
}

// 3. บันทึกข้อมูล (รองรับ 3 รูป)
function saveRecord(obj) {
  const ss = SpreadsheetApp.openById(SS_ID);
  const now = new Date();
  const formattedDate = Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy HH:mm");

  let urls = [];
  if (obj.files && obj.files.length > 0) {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    obj.files.forEach((fileObj, index) => {
      const blob = Utilities.newBlob(Utilities.base64Decode(fileObj.body.split(",")[1]), fileObj.type, obj.studentName + "_" + obj.course + "_" + now.getTime() + "_" + (index + 1));
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      urls.push(file.getUrl());
    });
  }
  const finalUrls = urls.join(",");

  const sheetRec = ss.getSheetByName('Rec');
  const header = `${obj.studentName} (${obj.course})`;
  let headers = sheetRec.getRange(1, 1, 1, Math.max(sheetRec.getLastColumn(), 1)).getValues()[0];
  let col = headers.indexOf(header) + 1;
  if (col === 0) { col = headers.filter(String).length + 1; sheetRec.getRange(1, col).setValue(header); }

  sheetRec.getRange(1, col, 8, 1).setValues([
    [header], [formattedDate], [obj.teacher], [obj.studyTimeRemain], [obj.course], [obj.content], [""], [finalUrls]
  ]);

  let sheetLog = ss.getSheetByName('Rec_Time_T');
  if (!sheetLog) {
    sheetLog = ss.insertSheet('Rec_Time_T');
    sheetLog.appendRow(['วันที่บันทึก', 'ชื่อครู', 'ชื่อคอร์ส', 'ชื่อผู้เรียน', 'เวลาที่เหลือล่าสุด', 'ลิ้งค์รูปภาพ', 'ชม.ที่สอนในครั้งนี้']);
  }
  sheetLog.appendRow([formattedDate, obj.teacher, obj.course, obj.studentName, obj.studyTimeRemain, finalUrls, obj.hourLearned]);
  return { msg: "บันทึกเรียบร้อย!" };
}

// 4. ดึงแกลเลอรีภาพทั้งหมดตามชื่อนักเรียนจาก Drive
function getStudentGallery(studentName) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const files = folder.getFiles();
    const gallery = [];
    while (files.hasNext()) {
      let file = files.next();
      if (file.getName().includes(studentName)) {
        gallery.push({ id: file.getId(), date: file.getDateCreated() });
      }
    }
    gallery.sort((a, b) => b.date - a.date);
    return gallery.map(item => item.id);
  } catch (e) { return []; }
}

// ฟังก์ชันเสริม
function checkLogin(u, p) {
  const sheet = SpreadsheetApp.openById(SS_ID).getSheetByName('ID_PASS');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().trim() == u && data[i][1].toString().trim() == p) {
      return { status: "success", role: data[i][2].toString().toLowerCase().trim(), studentName: data[i][3].toString().trim() };
    }
  }
  return { status: "fail", msg: "Username หรือ Password ไม่ถูกต้อง" };
}

function getStudentListData(role, name) {
  const sheet = SpreadsheetApp.openById(SS_ID).getSheetByName('StudentData');
  const data = sheet.getDataRange().getValues().slice(1);
  return data.filter(r => {
    const active = (r[7] || "").toString().toLowerCase() === "active";
    if (role === "admin") return active;
    return active && (r[8] || "").toString().includes(name);
  }).map(r => ({ name: r[0], course: r[1], pic: r[4], teacher: r[8], studyDay: r[11], studyTimeSlot: r[9] }));
}

function getTeacherList() {
  const data = SpreadsheetApp.openById(SS_ID).getSheetByName('ID_PASS').getDataRange().getValues();
  return data.slice(1).filter(r => r[2].toString().toLowerCase() === 'teacher').map(r => [r[0]]);
}

// 1. คำนวณยอดสอนสะสม (แยกทั้งหมด และ เดือนนี้)
function getTeacherStats(teacherName) {
  try {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName('Rec_Time_T');
    if (!sheet) return { total: "0.00", monthly: "0.00" };

    const data = sheet.getDataRange().getValues();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalAll = 0;
    let totalMonth = 0;

    for (let i = 1; i < data.length; i++) {
      let rowDateValue = data[i][0];
      let rowTeacher = data[i][1] ? data[i][1].toString().trim() : "";
      let hours = parseFloat(data[i][6]) || 0;

      // ตรวจสอบว่าเป็นครูคนเดียวกัน หรือเป็น admin
      if (teacherName === "admin" || rowTeacher === teacherName) {
        // สะสมทั้งหมด
        totalAll += hours;

        // เช็คเฉพาะเดือนนี้
        let rowDate = (rowDateValue instanceof Date) ? rowDateValue : null;
        if (!rowDate && rowDateValue) {
          let parts = rowDateValue.toString().split(' ')[0].split('/');
          if (parts.length === 3) rowDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }

        if (rowDate && rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear) {
          totalMonth += hours;
        }
      }
    }
    return {
      total: totalAll.toFixed(2),
      monthly: totalMonth.toFixed(2)
    };
  } catch (e) { return { total: "0.00", monthly: "0.00" }; }
}

function getStudentListUser(name) {
  const data = SpreadsheetApp.openById(SS_ID).getSheetByName('StudentData').getDataRange().getValues().slice(1);
  return data.filter(r => r[0].toString() === name).map(r => ({ name: r[0], course: r[1], pic: r[4] }));
}

// ฟังก์ชันดึงยอดสอนของครูเฉพาะเจาะจง (สำหรับส่วนที่ 3)
// ฟังก์ชันดึงยอดสอนของครูเฉพาะเจาะจง (เฉพาะเดือนปัจจุบัน)
function getSpecificTeacherHour(teacherName) {
  try {
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName('Rec_Time_T');
    if (!sheet || !teacherName || teacherName === "all") return "0.00";

    const data = sheet.getDataRange().getValues();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let total = 0;

    for (let i = 1; i < data.length; i++) {
      let rowDateValue = data[i][0];
      let rowTeacher = data[i][1] ? data[i][1].toString().trim() : "";
      let hours = parseFloat(data[i][6]) || 0;

      // ตรวจสอบชื่อครู
      if (rowTeacher === teacherName) {
        // ตรวจสอบวันที่ (แปลงค่าจากชีทให้เป็น Date Object)
        let rowDate = (rowDateValue instanceof Date) ? rowDateValue : null;
        if (!rowDate && rowDateValue) {
          let parts = rowDateValue.toString().split(' ')[0].split('/');
          if (parts.length === 3) rowDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }

        // เช็คว่าตรงกับเดือนและปีปัจจุบันหรือไม่
        if (rowDate && rowDate.getMonth() === currentMonth && rowDate.getFullYear() === currentYear) {
          total += hours;
        }
      }
    }
    return total.toFixed(2);
  } catch (e) { return "0.00"; }
}

// ฟังก์ชันดึง URL แอป
function getAppUrl() {
  return ScriptApp.getService().getUrl();
}
