# Stopky a výkony — dokumentace

Aplikace pro měření atletických disciplín u skupiny závodníků. Načteš si jména (ručně nebo z CSV), vybereš disciplínu, změříš stopkami časy postupně dobíhajících závodníků a časy jim přiřadíš. U skokanských a vrhačských disciplín zapisuješ výkony po pokusech. Všechno zůstává v telefonu.

---

## 1. Instalace na iPhone

Aplikace není z App Store — je to webová aplikace (PWA), která se přidá na plochu a od té chvíle se chová jako běžná appka: celá obrazovka, vlastní ikona, funguje bez signálu.

### Varianta A — plnohodnotná appka (doporučeno)

Potřebuješ soubory `index.html`, `app.js`, `sw.js`, `manifest.webmanifest` a tři ikony (vše je v `vykony-app.zip`) na nějaké HTTPS adrese. Nejjednodušší způsoby:

**GitHub Pages** (zdarma, cca 5 minut)
1. Na github.com vytvoř nový veřejný repozitář, např. `vykony`.
2. Rozbal ZIP a všechny soubory nahraj do kořene repozitáře (Add file → Upload files).
3. Settings → Pages → Source: *Deploy from a branch*, branch `main`, složka `/ (root)`, Save.
4. Za minutu běží na `https://tvojejmeno.github.io/vykony/`.

**Netlify Drop** (bez registrace): na `app.netlify.com/drop` přetáhneš rozbalenou složku a hned dostaneš adresu.

Pak na iPhonu: otevři adresu v **Safari** → ikona sdílení → **Přidat na plochu**. Musí to být Safari, Chrome na iOS přidání na plochu neumí.

### Varianta B — jeden soubor bez hostingu

Soubor `vykony-standalone.html` má v sobě všechno (HTML, styly i kód, 80 kB). Ulož ho do Souborů na iPhonu a otevírej poklepáním — otevře se v Safari a funguje.

Omezení: takto otevřená stránka nemá stálou adresu, takže **iOS jí nemusí zachovat uložená data** mezi otevřeními a nejde přidat na plochu. Používej ji na vyzkoušení; pro ostrý provoz jdi cestou A. Pokud přesto zůstaneš u varianty B, po každém měření si udělej export CSV nebo zálohu (Nastavení → Data).

### Varianta C — přes počítač v místní síti

Ve složce se soubory spusť `python3 -m http.server 8000` a na iPhonu ve stejné Wi-Fi otevři `http://IP-počítače:8000/`. Vhodné na testování; Safari umožní i přidání na plochu, ale offline cache se bez HTTPS chová hůř.

---

## 2. Co aplikace umí

**Závodníci**
- Ruční přidání (jméno, příjmení, skupina/třída, poznámka).
- Import CSV — poradí si se středníkem, čárkou i tabulátorem, s kódováním UTF-8 i Windows-1250 (typický export z Excelu), s hlavičkou i bez ní. Umí i prostý seznam „Petr Novák“ na řádcích. Duplicity přeskakuje.
- Export CSV, vyhledávání, filtr podle skupiny.

**Disciplíny**
- Přednastavených 13 (50–1500 m, skok daleký a vysoký, hod míčkem, vrh koulí, Cooper, shyby, leh-sedy), libovolné další si přidáš.
- U každé nastavíš: způsob měření (**čas** stopkami / **výkon** zápisem), jednotku, počet desetinných míst, počet pokusů, jestli je lepší vyšší nebo nižší hodnota.
- Nepovinné **známkovací limity** — zadáš hranice pro známky 1 až 4 a u každého výkonu se pak zobrazí známka (horší než hranice pro 4 = 5).

**Stopky (disciplíny na čas)**
- Volitelná **startovní listina**: před startem naklikáš jména v očekávaném pořadí doběhu a časy se pak přiřazují samy.
- **Start** spouští stopky okamžitě při klepnutí — dáš pokyn a zároveň klepneš. V Nastavení jde volitelně zapnout odpočet 3 / 5 / 10 s se zvukovou signalizací (poslední pípnutí je vyšší tón, ten je startovní), ve výchozím stavu je vypnutý.
- Během běhu velké tlačítko **Doběh**: klepneš při každém proběhnutí cílem, čas se odloží do seznamu. Tlačítko **Zpět** vezme poslední klepnutí zpátky (překlep při hromadném doběhu).
- Po **Stop** se objeví seznam všech časů; ke každému vybereš závodníka, čas můžeš doladit (klepnutím na hodnotu), smazat nebo přidat další ručně. Pak **Uložit výsledky**.
- Displej během měření nezhasíná (Screen Wake Lock).
- Samostatná funkce **Zapsat čas ručně** pro případ, že měřil někdo jiný.

**Výkonové disciplíny**
- Seznam závodníků s jejich osobním maximem; klepnutím se otevře zápis pokusů.
- Neplatný pokus zapíšeš jako `x`, započítá se nejlepší platný pokus.
- Tlačítko **Uložit a další** posouvá rovnou na dalšího v seznamu, takže projedeš celou třídu bez zavírání a otvírání.

**Výsledky**
- Pořadí podle disciplíny a skupiny (řadí se správně podle toho, jestli je lepší vyšší nebo nižší hodnota), nebo chronologický přehled.
- U každého výkonu známka (pokud jsou limity vyplněné) a označení osobního rekordu.
- Detail výkonu: historie závodníka v dané disciplíně, úprava hodnoty a data, poznámka, smazání.
- Export CSV — jedné tabulky nebo všech dat. Soubor je se středníky a s BOM, takže se v českém Excelu otevře rovnou správně rozdělený do sloupců a s háčky.

**Odeslání e-mailem**
- Tlačítko **Odeslat e-mailem** (v Nastavení i pod Výsledky) připraví dvě přílohy a otevře systémové sdílení, odkud vybereš Mail, Zprávy, WhatsApp nebo uložení do Souborů:
  - `vysledky-RRRR-MM-DD.csv` — tabulka všech výkonů k otevření v Excelu,
  - `zaloha-vykony-RRRR-MM-DD.json` — kompletní stav aplikace.
- Záloha obsahuje **závodníky, disciplíny včetně známkových limitů, všechny výkony i nastavení**. Když ji příjemce uloží do Souborů a načte v **Nastavení → Načíst zálohu**, má během chvilky aplikaci nastavenou úplně stejně.
- Při načtení zálohy si vybereš: **Nahradit vše** (čistý přenos na jiný telefon), nebo **Přidat k současným datům** — to jen doplní, co chybí, spáruje stejné závodníky a disciplíny podle jména a přeskočí duplicitní výkony. Hodí se, když měřili dva učitelé na dvou telefonech a data se mají spojit dohromady.
- Adresáta si můžeš předvyplnit v Nastavení; použije se, pokud zařízení nepodporuje sdílení souborů a appka spadne do náhradního režimu (oba soubory stáhne do Souborů a otevře prázdný e-mail s návodem).

**Ostatní**
- Datum a označení měření (např. „1.A“) u každého záznamu.
- Zvuk, odpočet a svícení displeje se dají vypnout.

---

## 3. Typický průběh měření 100 m

1. **Závodníci** → Import CSV → naimportuješ třídu.
2. **Měření** → vybereš `100 m`.
3. Nahoře zkontroluješ datum, vyplníš označení (`1.A`), dole vybereš skupinu.
4. Naklikáš startovní listinu v pořadí drah (nepovinné).
5. Dáš povel a zároveň klepneš na **Start** — stopky běží od té chvíle.
6. Při každém doběhu klepneš na **Doběh**. Vespod vidíš, kolikátý čas to byl.
7. **Stop** → u každého času potvrdíš nebo změníš jméno → **Uložit výsledky**.
8. **Výsledky** → hotové pořadí, případně **Odeslat e-mailem**.

---

## 4. Formát CSV pro import

Rozpoznávané hlavičky (bez ohledu na velikost písmen a diakritiku): `Jméno`, `Příjmení`, `Třída` / `Skupina` / `Ročník` / `Kategorie`, `Poznámka`.

```
Jméno;Příjmení;Třída
Petr;Novák;1.A
Martin;Dvořák;1.A
Jan;Svoboda;2.B
```

Funguje i bez hlavičky (`Petr;Novák;1.A`) a i takhle:

```
Petr Novák
Martin Dvořák
```

U celých jmen se poslední slovo bere jako příjmení. V dialogu importu můžeš všechny řádky najednou zařadit do jedné skupiny. Vzor je v souboru `vzor-zavodnici.csv`.

---

## 5. Jak je to udělané

### Technologie
Čistý HTML, CSS a JavaScript, žádný framework ani knihovna, žádné volání na internet. Důvod: aplikace musí nastartovat okamžitě a fungovat na stadionu bez signálu, a za pár let nemá co přestat fungovat kvůli závislostem.

| Soubor | Obsah |
|---|---|
| `index.html` | kostra rozhraní a všechny styly |
| `app.js` | veškerá logika (~1 100 řádků) |
| `sw.js` | service worker — offline cache |
| `manifest.webmanifest` | název, ikony, režim celé obrazovky |
| `icon-*.png` | ikony pro plochu |
| `vykony-standalone.html` | vše slepené do jednoho souboru |

### Ukládání dat
Celá databáze je jeden objekt uložený jako JSON v `localStorage` pod klíčem `vykony.db.v1`. Zápis je odložený o 120 ms, aby rychlé klepání neblokovalo rozhraní. Když prohlížeč úložiště zakáže (anonymní režim, přísná nastavení), aplikace nespadne — jede dál v paměti a v Nastavení se objeví červené upozornění.

```js
DB = {
  athletes:    [{ id, first, last, group, note }],
  disciplines: [{ id, name, type:'time'|'measure', unit, dec, attempts,
                  better:'lower'|'higher', grades:[4 hranice]|null }],
  results:     [{ id, athleteId, discId, value, attempts, date,
                  session, note, created }],
  settings:    { sound, countdown, awake, lastGroup }
}
```

`value` je u časů **celé číslo v milisekundách**, u výkonů číslo v jednotce disciplíny. Díky tomu je porovnávání a řazení přesné a formátování (12,34 / 1:23,45) je čistě věc zobrazení.

### Měření času
Používá se `performance.now()` — monotónní hodiny, které se na rozdíl od `Date.now()` neposunou při změně systémového času a nejsou závislé na tom, co dělá zbytek systému. Uloží se okamžik startu, každé klepnutí na Doběh spočítá rozdíl.

Zobrazení běžícího času aktualizuje `requestAnimationFrame`, ale **naměřená hodnota se nikdy nebere z displeje** — vždy se počítá v okamžiku klepnutí. I když se vykreslování zadrhne, čas je přesný. Přesnost je tedy dána reakcí měřiče, ne aplikací (počítej s ±0,1–0,2 s, stejně jako u ručních stopek).

Displej drží rozsvícený Screen Wake Lock API; při návratu z pozadí se zámek automaticky obnovuje. Zvuk volitelné startovní signalizace generuje Web Audio API (obdélníková vlna), takže není potřeba žádný zvukový soubor.

### Odesílání souborů
Webová stránka nemůže sama přiložit soubor k e-mailu (`mailto:` přílohy neumí). Používá se proto **Web Share API Level 2** — aplikace vyrobí dva objekty `File` v paměti a předá je systémovému sdílení iOS, které je vloží do Mailu jako skutečné přílohy. Sdílení musí být spuštěné přímo z dotyku, proto se soubory sestavují synchronně ještě před voláním.

Kde to není podporované (starší iOS, desktopové prohlížeče), spadne appka do náhradního režimu: oba soubory stáhne a otevře e-mail s předvyplněným předmětem a textem, přílohy se doplní ručně.

Sloučení dvou záloh (`mergeDB`) páruje závodníky podle id, a když se neshoduje, podle kombinace jméno + příjmení + skupina; disciplíny podle id nebo názvu. Vznikne převodní tabulka starých id na nová a teprve podle ní se přenášejí výkony, takže se záznamy nikdy nenavážou na cizího člověka. Výkon se považuje za duplicitní, pokud se shoduje závodník, disciplína, datum i hodnota.

### Rozhraní
Bez routeru a bez virtuálního DOMu: `render()` podle stavu složí HTML řetězec a vloží ho do `#view`. Kliky se řeší jedním delegovaným posluchačem přes atributy `data-act`, takže se nikde nemusí odpojovat posluchače a nemůžou vznikat duchové ze starých vykreslení.

Dvě místa se překreslují cíleně mimo tuto smyčku, aby se nic neztratilo: seznam mezičasů během běhu a seznam závodníků při psaní do hledání (jinak by pole ztratilo fokus).

Vzhled je stavěný na použití venku a jednou rukou: tmavé pozadí kvůli čitelnosti a výdrži baterie, časomíra ve žlutém neproporcionálním písmu s pevnou šířkou číslic (neposkakuje), hlavní tlačítka vysoká přes 130 px, ovládání dole v dosahu palce, respektované bezpečné okraje iPhonu.

### Pojistky proti ztrátě dat
- Odchod z rozměřené disciplíny se ptá na potvrzení.
- Zavření karty během běhu stopek vyvolá varování prohlížeče.
- Přiřazení jednoho závodníka ke dvěma časům se hlásí před uložením.
- Mazání čehokoli chce potvrzení; smazání závodníka i disciplíny odstraní i jejich výsledky, aby nezůstávaly osiřelé záznamy.

---

## 6. Když něco nefunguje

| Problém | Řešení |
|---|---|
| Data se po zavření ztrácejí | Otevírej appku z plochy, ne v anonymním okně. U varianty B (jeden soubor) je to očekávané chování — přejdi na hosting. |
| Nejde „Přidat na plochu“ | Musí to být Safari a stránka na `http(s)://`, ne otevřený soubor. |
| Odpočet nepípá | iPhone má přepínač vyzvánění na tichý režim; zvuk z webu se přehraje až po prvním dotyku na stránce. |
| Displej zhasíná | Zkontroluj Nastavení → *Nechat displej svítit*. Na starších verzích iOS (pod 16.4) tato funkce není dostupná — nastav delší automatické zamykání v systému. |
| Excel zobrazí CSV v jednom sloupci | Otevři přes Data → Načíst z textu a vyber středník jako oddělovač. |
| Sdílení nenabídne Mail s přílohami | Starší iOS neumí sdílet soubory. Appka místo toho oba soubory stáhne do Souborů → Stažené a otevře prázdný e-mail — přílohy k němu přidáš klipsem. |
| Po aktualizaci souborů se změny neprojeví | Service worker drží starou verzi. Zvyš `V` v `sw.js`, nebo appku smaž z plochy a přidej znovu. |

---

## 7. Kam to jde dál rozšířit

- Mezičasy pro jednoho běžce (rozdělení `splits` podle typu disciplíny — datový model to už umožňuje).
- Bodovací tabulky IAAF nebo školní normy místo pevných známkovacích hranic.
- Vývoj výkonu v čase jako graf u každého závodníka (historie se už ukládá).
- Družstva a součty bodů za štafety.
- Nativní verze pro iOS ve SwiftUI — vyžaduje Mac s Xcode a každých 7 dní přeinstalování, pokud nemáš placený vývojářský účet. Datový model by šel převzít beze změny.
