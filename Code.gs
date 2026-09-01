/* =========================================================================
   Code.gs : backend du site (Google Apps Script)
   À coller dans Extensions > Apps Script d'une feuille Google Sheets,
   puis déployer en application web. Voir README.md section 6.
   ========================================================================= */

/* ---------- Réglages ---------- */
var AUTO_APPROVE = true;   // true  : l'inscription compte tout de suite
                           // false : elle reste "معلق" jusqu'à ta validation

var S_AGES = 'الأعصار';
var S_JOIN = 'الانتسابات';
var S_ACT  = 'الأنشطة';
var S_SUP  = 'الداعمون';

var ST_OK      = 'مقبول';
var ST_PENDING = 'معلق';

/* =========================================================================
   1. Installation : lancer setup() UNE SEULE FOIS depuis l'éditeur
   ========================================================================= */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  mkSheet(ss, S_AGES, ['العصر', 'العدد الإجمالي']);
  mkSheet(ss, S_JOIN, ['التاريخ', 'الاسم', 'الهاتف', 'العصر', 'سنة الميلاد', 'المهنة', 'ملاحظات', 'الحالة']);
  mkSheet(ss, S_ACT,  ['العنوان', 'التاريخ', 'الحالة', 'الوصف', 'رابط الصورة', 'الرابط']);
  mkSheet(ss, S_SUP,  ['الاسم', 'المبلغ', 'ملاحظة']);
  var d = ss.getSheetByName('Sheet1') || ss.getSheetByName('ورقة1');
  if (d && ss.getSheets().length > 4) ss.deleteSheet(d);
  return 'تم إنشاء الأوراق';
}

function mkSheet(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#14563F').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
    sh.setRightToLeft(true);
  }
  return sh;
}

/* =========================================================================
   2. Lecture : le site appelle ...exec?action=stats
   ========================================================================= */
function doGet(e) {
  try {
    var cache = CacheService.getScriptCache();
    var hit = cache.get('stats');
    if (hit) return json(JSON.parse(hit));
    var data = buildStats();
    cache.put('stats', JSON.stringify(data), 30);
    return json(data);
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function buildStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var counts = {};
  var total = 0;
  rows(ss, S_JOIN).forEach(function (r) {
    var status = String(r[7] || '').trim();
    if (status && status !== ST_OK) return;
    total++;
    var age = String(r[3] || '').trim();
    if (age) counts[age] = (counts[age] || 0) + 1;
  });

  var ages = rows(ss, S_AGES).filter(function (r) { return String(r[0]).trim(); })
    .map(function (r) {
      var name = String(r[0]).trim();
      return { name: name, target: toInt(r[1]), members: counts[name] || 0, accounts: 0 };
    });

  var activities = rows(ss, S_ACT).filter(function (r) { return String(r[0]).trim(); })
    .map(function (r) {
      return {
        title: String(r[0]).trim(),
        date: String(r[1] || '').trim(),
        status: mapStatus(r[2]),
        description: String(r[3] || '').trim(),
        image: String(r[4] || '').trim(),
        link: String(r[5] || '').trim()
      };
    });

  var supporters = rows(ss, S_SUP).filter(function (r) { return String(r[0]).trim(); })
    .map(function (r) {
      return { name: String(r[0]).trim(), amount: toInt(r[1]), note: String(r[2] || '').trim() };
    });

  return { ok: true, total: total, ages: ages, activities: activities, supporters: supporters };
}

function mapStatus(v) {
  var s = String(v || '').trim();
  if (s === 'جارٍ' || s === 'جاري' || s === 'running') return 'running';
  if (s === 'انتهى' || s === 'ended') return 'ended';
  if (s === 'قادم' || s === 'upcoming') return 'upcoming';
  return '';
}

/* =========================================================================
   3. Écriture : le formulaire envoie une inscription
   ========================================================================= */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var body = JSON.parse(e.postData.contents || '{}');
    var d = body.data || {};

    var name  = String(d['الاسم'] || '').trim();
    var phone = String(d['الهاتف'] || '').trim();
    if (!name || !phone) return json({ ok: false, error: 'الاسم ورقم الهاتف مطلوبان' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(S_JOIN);
    if (!sh) return json({ ok: false, error: 'الأوراق غير جاهزة، شغّل setup()' });

    var norm = phone.replace(/\D/g, '');
    var dup = rows(ss, S_JOIN).some(function (r) {
      return String(r[2] || '').replace(/\D/g, '') === norm;
    });
    if (dup) return json({ ok: false, error: 'هذا الرقم مسجّل من قبل' });

    sh.appendRow([
      new Date(), name, phone,
      String(d['العصر'] || '').trim(),
      String(d['سنة الميلاد'] || '').trim(),
      String(d['المهنة'] || '').trim(),
      String(d['ملاحظات'] || '').trim(),
      AUTO_APPROVE ? ST_OK : ST_PENDING
    ]);

    CacheService.getScriptCache().remove('stats');
    return json({ ok: true, approved: AUTO_APPROVE });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/* ---------- utilitaires ---------- */
function rows(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
}
function toInt(v) { var n = parseInt(String(v).replace(/\D/g, ''), 10); return isNaN(n) ? 0 : n; }
function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
