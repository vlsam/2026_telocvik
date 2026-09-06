/**
 * Most mezi aplikací Stopky a výkony a Google tabulkou.
 *
 * Nasazení (stačí jednou):
 *  1. Otevři svou tabulku → Rozšíření → Apps Script.
 *  2. Smaž ukázkový kód, vlož celý tento soubor, ulož (ikona diskety).
 *  3. Nasadit → Nové nasazení → typ Webová aplikace.
 *       Spustit jako:      Já
 *       Kdo má přístup:    Kdokoli
 *  4. Povol přístup (Google varuje, že skript není ověřený – je tvůj vlastní,
 *     klepni na Rozšířené → Přejít na projekt).
 *  5. Zkopíruj vzniklou adresu končící na /exec a vlož ji v aplikaci
 *     do Nastavení → Google tabulka → Adresa skriptu tabulky.
 *
 * Po každé úpravě tohoto kódu je potřeba Nasadit → Spravovat nasazení →
 * tužka → Verze: Nová verze → Nasadit. Adresa zůstává stejná.
 */

var SHEET_ID = '1KPsHM_cYwhb_cKvOa_pmqPV36Lu_r-j1hIusruUktzE';
var DATA_SHEET = '_data';   // skrytý list s úplnou zálohou pro zpětné načtení
var CHUNK = 40000;          // buňka Google tabulky pobere 50 000 znaků

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);
    if (req.action === 'sync') return out(sync(req));
    if (req.action === 'pull') return out({ ok: true, data: readRaw() });
    return out({ ok: false, error: 'Neznámá akce: ' + req.action });
  } catch (err) {
    return out({ ok: false, error: String((err && err.message) || err) });
  }
}

/** Otevření adresy v prohlížeči vrátí uložená data – hodí se na ověření, že skript žije. */
function doGet() {
  try { return out({ ok: true, data: readRaw() }); }
  catch (err) { return out({ ok: false, error: String((err && err.message) || err) }); }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

function book() { return SpreadsheetApp.openById(SHEET_ID); }

function sync(req) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);                     // dva telefony najednou si nepřepíšou data
  try {
    var s = req.sheets || {};
    writeSheet('Závodníci', s.athletes);
    writeSheet('Disciplíny', s.disciplines);
    writeSheet('Výkony', s.results);
    writeSheet('Nastavení', s.settings);
    writeRaw(req.raw || '');
    return {
      ok: true,
      athletes: Math.max(0, (s.athletes || []).length - 1),
      results: Math.max(0, (s.results || []).length - 1),
      time: new Date().toISOString()
    };
  } finally {
    lock.releaseLock();
  }
}

/** Celý list se pokaždé přepíše – výsledek je vždy přesný obraz aplikace. */
function writeSheet(name, rows) {
  if (!rows || !rows.length) return;
  var doc = book();
  var sh = doc.getSheetByName(name) || doc.insertSheet(name);
  sh.clear();

  var width = 1;
  for (var i = 0; i < rows.length; i++) width = Math.max(width, rows[i].length);
  var data = rows.map(function (r) {
    var c = r.slice();
    while (c.length < width) c.push('');
    return c.map(function (v) { return v === null || v === undefined ? '' : v; });
  });

  sh.getRange(1, 1, data.length, width).setValues(data);
  sh.getRange(1, 1, 1, width).setFontWeight('bold').setBackground('#efefef');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, Math.min(width, 12));
}

function writeRaw(raw) {
  var doc = book();
  var sh = doc.getSheetByName(DATA_SHEET);
  if (!sh) { sh = doc.insertSheet(DATA_SHEET); sh.hideSheet(); }
  sh.clear();
  var parts = [];
  for (var i = 0; i < raw.length; i += CHUNK) parts.push([raw.substr(i, CHUNK)]);
  if (parts.length) sh.getRange(1, 1, parts.length, 1).setValues(parts);
}

function readRaw() {
  var sh = book().getSheetByName(DATA_SHEET);
  if (!sh || sh.getLastRow() === 0) return '';
  return sh.getDataRange().getValues().map(function (r) { return r[0]; }).join('');
}
