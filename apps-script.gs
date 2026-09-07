/**
 * Most mezi aplikací Stopky a výkony a Google tabulkou.
 *
 * NASAZENÍ (a stejně tak po každé úpravě tohoto kódu):
 *  1. Tabulka → Rozšíření → Apps Script.
 *  2. Smaž, co tam je, vlož celý tento soubor, ulož (ikona diskety).
 *  3. Nasadit → Nové nasazení → typ Webová aplikace
 *       Spustit jako:    Já
 *       Kdo má přístup:  Kdokoli
 *  4. Google upozorní, že skript není ověřený – je tvůj vlastní:
 *     Rozšířené → Přejít na projekt → Povolit.
 *  5. Adresa končící na /exec už je v aplikaci vyplněná.
 *
 * POZOR: úprava kódu se sama nenasadí. Je potřeba
 *   Nasadit → Spravovat nasazení → tužka → Verze: NOVÁ VERZE → Nasadit.
 * Jinak na adrese pořád běží starý kód. Adresa zůstává stejná.
 *
 * OVĚŘENÍ: otevři adresu /exec v prohlížeči. Musí se objevit {"ok":true,...}.
 * Když se objeví přihlašovací stránka Google, není nasazený pro „Kdokoli“.
 */

var SHEET_ID = '1KPsHM_cYwhb_cKvOa_pmqPV36Lu_r-j1hIusruUktzE';
var DATA_SHEET = '_data';   // skrytý list s úplnou zálohou pro zpětné načtení
var SNAP_PREFIX = '_zaloha';// rotující snímky předchozích stavů
var SNAP_COUNT = 8;         // kolik snímků se drží
var CHUNK = 40000;          // buňka Google tabulky pobere 50 000 znaků

/* ---------- vstupní body ---------- */

/** Čtení: ?action=status (výchozí) nebo ?action=pull, volitelně &callback=… pro JSONP. */
function doGet(e) {
  var p = (e && e.parameter) || {};
  var res;
  try {
    if (p.action === 'pull') res = { ok: true, data: readRaw(), rev: rev() };
    else if (p.action === 'snapshots') res = { ok: true, list: snapshotList() };
    else if (p.action === 'restore') res = restoreSnapshot(Number(p.i));
    else res = status();
  } catch (err) {
    res = { ok: false, error: msg(err) };
  }
  return reply(res, p.callback);
}

/** Zápis: tělo je JSON, nebo formulářové pole payload (cesta bez CORS). */
function doPost(e) {
  var p = (e && e.parameter) || {};
  try {
    var body = p.payload || (e && e.postData ? e.postData.contents : '');
    if (!body) throw new Error('Prázdný požadavek.');
    var req = JSON.parse(body);
    if (req.action === 'pull') return reply({ ok: true, data: readRaw(), rev: rev() }, p.callback);
    if (req.action === 'status') return reply(status(), p.callback);
    if (req.action === 'sync') return reply(sync(req), p.callback);
    return reply({ ok: false, error: 'Neznámá akce: ' + req.action }, p.callback);
  } catch (err) {
    return reply({ ok: false, error: msg(err) }, p.callback);
  }
}

function msg(err) { return String((err && err.message) || err); }

/** S callbackem vrací JavaScript (JSONP), bez něj čistý JSON. */
function reply(o, callback) {
  var text = JSON.stringify(o);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + text + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------- akce ---------- */

function book() { return SpreadsheetApp.openById(SHEET_ID); }

/** Kolik toho v tabulce leží – aplikace si tím ověřuje, že zápis prošel. */
function status() {
  var counts = { athletes: 0, disciplines: 0, results: 0 };
  var raw = readRaw();
  if (raw) {
    try {
      var d = JSON.parse(raw);
      counts.athletes = live(d.athletes).length;
      counts.disciplines = live(d.disciplines).length;
      counts.results = live(d.results).length;
    } catch (e) { }
  }
  return {
    ok: true,
    name: book().getName(),
    athletes: counts.athletes,
    disciplines: counts.disciplines,
    results: counts.results,
    rev: rev(),
    updated: props().getProperty('lastSync') || ''
  };
}

/* Zápis je povolen jen tomu, kdo vychází z aktuální verze dat. Kdo přijde
   se zastaralou, dostane odmítnutí a jeho aplikace si nejdřív načte novější
   stav, sloučí ho a zkusí to znovu. Tím se nemůže stát, že by jeden telefon
   přepsal to, co druhý zapsal před vteřinou. */
function sync(req) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    var current = rev();
    if (req.base !== null && req.base !== undefined && Number(req.base) !== current) {
      return { ok: false, conflict: true, rev: current,
               error: 'Tabulku mezitím změnil někdo jiný.' };
    }
    snapshot(req.device);                   // odložíme předchozí stav

    var s = req.sheets || {};
    writeSheet('Závodníci', s.athletes);
    writeSheet('Disciplíny', s.disciplines);
    writeSheet('Výkony', s.results);
    writeSheet('Známkování', s.scales);
    writeSheet('Nastavení', s.settings);
    writeRaw(req.raw || '');

    var now = new Date().toISOString();
    props().setProperty('lastSync', now);
    props().setProperty('lastDevice', req.device || '');
    var next = current + 1;
    props().setProperty('rev', String(next));
    return {
      ok: true, rev: next,
      athletes: Math.max(0, (s.athletes || []).length - 1),
      results: Math.max(0, (s.results || []).length - 1),
      updated: now
    };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- verze a snímky ---------- */

function props() { return PropertiesService.getScriptProperties(); }
function rev() { return Number(props().getProperty('rev') || 0); }
function live(arr) {
  return (arr || []).filter(function (x) { return !x.del; });
}

/** Před každým zápisem odloží dosavadní stav do rotujícího skrytého listu. */
function snapshot(device) {
  var raw = readRaw();
  if (!raw) return;
  var slot = (Number(props().getProperty('snapSlot') || 0) % SNAP_COUNT) + 1;
  var sh = sheetNamed(SNAP_PREFIX + slot, true);
  sh.clear();
  var counts = { athletes: 0, results: 0 };
  try {
    var d = JSON.parse(raw);
    counts.athletes = live(d.athletes).length;
    counts.results = live(d.results).length;
  } catch (e) { }
  var rows = [[new Date().toISOString(), device || '', counts.athletes, counts.results]];
  for (var i = 0; i < raw.length; i += CHUNK) rows.push([raw.substr(i, CHUNK), '', '', '']);
  sh.getRange(1, 1, rows.length, 4).setValues(rows);
  props().setProperty('snapSlot', String(slot));
}

function snapshotList() {
  var out = [];
  for (var i = 1; i <= SNAP_COUNT; i++) {
    var sh = book().getSheetByName(SNAP_PREFIX + i);
    if (!sh || sh.getLastRow() === 0) continue;
    var head = sh.getRange(1, 1, 1, 4).getValues()[0];
    out.push({ i: i, time: head[0], device: head[1], athletes: head[2], results: head[3] });
  }
  out.sort(function (a, b) { return String(b.time).localeCompare(String(a.time)); });
  return out;
}

function restoreSnapshot(i) {
  if (!(i >= 1 && i <= SNAP_COUNT)) return { ok: false, error: 'Neplatná záloha.' };
  var sh = book().getSheetByName(SNAP_PREFIX + i);
  if (!sh || sh.getLastRow() < 2) return { ok: false, error: 'Záloha je prázdná.' };
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    snapshot('před obnovením');
    var vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
    var raw = vals.map(function (r) { return r[0]; }).join('');
    writeRaw(raw);
    props().setProperty('rev', String(rev() + 1));
    return { ok: true, rev: rev() };
  } finally {
    lock.releaseLock();
  }
}

function sheetNamed(name, hidden) {
  var doc = book();
  var sh = doc.getSheetByName(name);
  if (!sh) { sh = doc.insertSheet(name); if (hidden) sh.hideSheet(); }
  return sh;
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
    return c.map(function (v) { return (v === null || v === undefined) ? '' : v; });
  });

  sh.getRange(1, 1, data.length, width).setValues(data);
  sh.getRange(1, 1, 1, width).setFontWeight('bold').setBackground('#efefef');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, Math.min(width, 12));
}

function writeRaw(raw) {
  var sh = sheetNamed(DATA_SHEET, true);
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

/** Ruční kontrola z editoru: spusť a podívej se do protokolu. */
function test() {
  Logger.log(JSON.stringify(status()));
}
