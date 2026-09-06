# Stopky a výkony — dokumentace

Aplikace pro měření atletických disciplín u skupiny závodníků. Načteš si jména (ručně nebo z CSV), vybereš disciplínu, změříš stopkami časy postupně dobíhajících závodníků a časy jim přiřadíš. U skokanských a vrhačských disciplín zapisuješ výkony po pokusech. Všechno zůstává v telefonu.

---

## 1. Instalace na iPhone

Aplikace není z App Store — je to webová aplikace (PWA), která se přidá na plochu a od té chvíle se chová jako běžná appka: celá obrazovka, vlastní ikona, funguje bez signálu. Celý kód je v jediném souboru **`index.html`**, ostatní soubory jen doplňují ikonu a offline režim.

### Varianta A — GitHub Pages (doporučeno)

1. Na github.com vytvoř nový **veřejný** repozitář, např. `vykony`.
2. Rozbal `vykony-app.zip` a nahraj **obsah složky** do kořene repozitáře (Add file → Upload files). V kořeni musí ležet `index.html`, ne složka, jinak Pages nic nezobrazí.
3. Settings → Pages → Source: *Deploy from a branch*, branch `main`, složka `/ (root)`, Save.
4. Za minutu běží na `https://tvojejmeno.github.io/vykony/`.
5. Na iPhonu otevři adresu v **Safari** → ikona sdílení → **Přidat na plochu**. Musí to být Safari, Chrome na iOS přidání na plochu neumí.

Když budeš appku později upravovat, stačí v repozitáři nahradit `index.html` a v `sw.js` zvýšit číslo u `const V`, aby si telefon stáhl novou verzi.

### Varianta B — bez hostingu

`index.html` funguje i sám o sobě: ulož ho do Souborů na iPhonu a otevírej poklepáním. Vhodné na rychlé vyzkoušení. iOS ale takto otevřené stránce **nemusí zachovat uložená data** mezi otevřeními a nejde přidat na plochu — pro ostrý provoz jdi cestou A.

### Varianta C — přes počítač v místní síti

Ve složce se soubory spusť `python3 -m http.server 8000` a na iPhonu ve stejné Wi-Fi otevři `http://IP-počítače:8000/`. Vhodné na testování; offline cache se ale bez HTTPS chová hůř.

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

**Google tabulka**
- Všechno se dá uložit do tvé Google tabulky: závodníci, disciplíny se známkovými limity, všechny výkony i nastavení. Nastavení a zapojení popisuje kapitola 5.
- **Test připojení** kdykoli ověří, že tabulka odpovídá, a ukáže, kolik v ní leží záznamů proti tomu, co máš v telefonu.
- **Uložit do tabulky** přepíše čtyři listy — `Závodníci`, `Disciplíny`, `Výkony`, `Nastavení` — takže obsah tabulky vždy přesně odpovídá tomu, co máš v telefonu.
- **Ukládat průběžně** pošle data samo pár vteřin po každé změně, takže tabulka je aktuální bez jediného klepnutí navíc.
- **Načíst z tabulky** stáhne stav zpátky do telefonu — buď nahradí vše (nový telefon), nebo doplní jen to, co chybí (spojení dat od dvou učitelů).
- Bez signálu se nic neztratí: měříš dál do telefonu a odešle se to, až budeš online.

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

## 5. Napojení na Google tabulku

Statická stránka na GitHubu se nemůže sama přihlásit k tvému Google účtu, a tedy ani zapisovat do tabulky. Prostředníkem je proto malý skript **Google Apps Script**, který k tabulce připojíš. Skript běží pod tvým účtem, má do tabulky přístup a zveřejní adresu, na kterou aplikace posílá data. Nastavuje se jednou, cca 5 minut.

Adresa skriptu i ID tabulky jsou v aplikaci i ve skriptu **už vyplněné**, takže zbývá jen nasadit kód.

### Nasazení skriptu

1. Otevři tabulku → **Rozšíření → Apps Script**.
2. Smaž, co je v editoru, vlož celý obsah souboru `apps-script.gs` a ulož (ikona diskety).
3. **Nasadit → Spravovat nasazení** → u existujícího nasazení klepni na **tužku** → Verze: **Nová verze** → **Nasadit**.
   Pokud tam ještě žádné nasazení nemáš: **Nasadit → Nové nasazení**, typ **Webová aplikace**, *Spustit jako:* **Já**, *Kdo má přístup:* **Kdokoli**.
4. Google upozorní, že skript není ověřený. Je tvůj vlastní — *Rozšířené* → *Přejít na projekt* → *Povolit*.
5. V aplikaci: **Nastavení → Google tabulka → Test připojení**. Musí se objevit název tabulky a počty záznamů.

**Nejčastější důvod, proč se data neukládají:** kód se v editoru uloží, ale nasazení dál běží ve staré verzi. Uložení diskety nestačí — vždy je potřeba krok 3 s volbou *Nová verze*. Adresa `/exec` přitom zůstává stejná.

Ověřit se to dá i bez telefonu: otevři adresu `/exec` v prohlížeči. Má se objevit `{"ok":true,...}` s názvem tabulky. Přihlašovací stránka Google znamená, že nasazení nemá přístup „Kdokoli".

Adresa `/exec` je sice veřejná, ale nezveřejňuje tabulku — kdo ji nemá, k datům se nedostane. Přesto ji nedávej do veřejného repozitáře; v aplikaci je uložená v telefonu.

### Co v tabulce vznikne

| List | Obsah |
|---|---|
| `Závodníci` | id, jméno, příjmení, skupina, poznámka |
| `Disciplíny` | způsob měření, jednotka, počet pokusů, orientace a všechny čtyři známkové limity |
| `Výkony` | datum, závodník, disciplína, výkon jako text (`12,34`) i jako **číslo** pro řazení a grafy, známka, pokusy, označení měření |
| `Nastavení` | přehled voleb a čas poslední synchronizace |
| `_data` | skrytý list s úplnou zálohou, ze které se stav načítá zpátky do telefonu |

Listy se při každém odeslání přepisují celé, takže tabulka je vždy přesným obrazem aplikace. **Ruční úpravy v listech se proto při dalším odeslání ztratí** — chceš-li si v tabulce dělat vlastní výpočty a grafy, založ si na ně samostatný list a odkazuj se do těchto čtyř.

### Přenos mezi telefony

Adresu skriptu vlož do obou telefonů. První pošle data (*Uložit do tabulky*), druhý si je stáhne (*Načíst z tabulky*) a zvolí:

- **Nahradit vše** — telefon bude mít přesně to, co je v tabulce.
- **Přidat k současným datům** — doplní jen chybějící; závodníky a disciplíny spáruje podle jména, duplicitní výkony přeskočí. Tímhle spojíš měření dvou učitelů z různých stanovišť.

Pozor na pořadí: kdo naposledy klepne na *Uložit do tabulky*, ten přepíše obsah tabulky svým stavem. Při měření ve dvou tedy nejdřív jeden odešle, druhý si data načte a sloučí, a teprve pak odešle výsledek zpátky.

## 6. Jak je to udělané

### Technologie
Čistý HTML, CSS a JavaScript, žádný framework ani knihovna, žádné volání na internet. Důvod: aplikace musí nastartovat okamžitě a fungovat na stadionu bez signálu, a za pár let nemá co přestat fungovat kvůli závislostem.

| Soubor | Obsah |
|---|---|
| `index.html` | celá aplikace — rozhraní, styly i logika (~1 400 řádků) |
| `sw.js` | service worker — offline cache |
| `manifest.webmanifest` | název, ikony, režim celé obrazovky |
| `icon-*.png` | ikony pro plochu |
| `apps-script.gs` | kód pro Apps Script v Google tabulce |
| `vzor-zavodnici.csv` | ukázka formátu pro import |

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

### Komunikace s tabulkou
Tohle je na celé aplikaci technicky nejcitlivější místo. Apps Script odpovídá přesměrováním na jinou doménu a ne vždy pošle hlavičky CORS, které prohlížeč vyžaduje, aby směl odpověď vůbec předat stránce. Požadavek přitom klidně proběhne, ale stránka se o výsledku nedozví — a právě v tom stavu to vypadá, že se „nic neukládá".

Aplikace proto zkouší tři cesty a použije první, která projde:

1. **Přímý `fetch`** s hlavičkou `text/plain`. Prostý text je zvolený schválně: `application/json` by vyvolal kontrolní dotaz OPTIONS, na který Apps Script neumí odpovědět. Tělo je normální JSON, jen jinak deklarované.
2. **Odeslání formulářem** do skrytého rámu. Na klasické odeslání formuláře se CORS nevztahuje, takže data dorazí vždy. Odpověď se ale přečíst nedá, proto po odeslání následuje dotaz na stav a porovná se počet výkonů — teprve shoda znamená úspěch. Když se čísla liší, aplikace to řekne rovnou.
3. **JSONP pro čtení.** Odpověď se načte jako `<script>`, což CORS neřeší vůbec. Tudy jde *Načíst z tabulky* i *Test připojení*.

Posílají se dvě věci najednou: **hotové tabulky** k zapsání do listů (aplikace je připraví, skript je jen zapíše) a **úplná záloha** jako JSON řetězec. Záloha se ukládá po 40 000 znacích do skrytého listu `_data`, protože buňka Google tabulky pobere 50 000 znaků. Díky tomu je zpětné načtení bezeztrátové — nemusí se nic dolovat zpátky z naformátovaných buněk.

Skript si při zápisu bere `LockService`, aby dva telefony odesílající naráz nepřepsaly data uprostřed zápisu.

Automatické ukládání je navěšené na jediném místě — na funkci `save()`, kterou volá každá změna dat. Odeslání se odloží o 4 sekundy, takže rychlé zapisování celé třídy skončí jedním požadavkem místo třiceti. Zápis, který provede sama synchronizace (čas poslední synchronizace), je označený příznakem `suspend`, aby se nespustila nekonečná smyčka.

Selhání sítě nikdy neshodí uložení dat: nejdřív se zapíše do telefonu, teprve pak se zkouší odeslat. Když odeslání selže, zůstane hláška v Nastavení a další pokus přijde s příští změnou nebo při návratu online.

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

## 7. Když něco nefunguje

| Problém | Řešení |
|---|---|
| Data se po zavření ztrácejí | Otevírej appku z plochy, ne v anonymním okně. U varianty B (jeden soubor) je to očekávané chování — přejdi na hosting. |
| Nejde „Přidat na plochu“ | Musí to být Safari a stránka na `http(s)://`, ne otevřený soubor. |
| Odpočet nepípá | iPhone má přepínač vyzvánění na tichý režim; zvuk z webu se přehraje až po prvním dotyku na stránce. |
| Displej zhasíná | Zkontroluj Nastavení → *Nechat displej svítit*. Na starších verzích iOS (pod 16.4) tato funkce není dostupná — nastav delší automatické zamykání v systému. |
| Excel zobrazí CSV v jednom sloupci | Otevři přes Data → Načíst z textu a vyber středník jako oddělovač. |
| Sdílení nenabídne Mail s přílohami | Starší iOS neumí sdílet soubory. Appka místo toho oba soubory stáhne do Souborů → Stažené a otevře prázdný e-mail — přílohy k němu přidáš klipsem. |
| Do tabulky se nic neukládá | Nastavení → Google tabulka → **Test připojení**. Hláška řekne, co dělat; v devíti z deseti případů chybí nasazení nové verze skriptu. |
| Tabulka hlásí, že skript nevrátil data | Nasazení není nastavené na „Kdokoli". Nasadit → Spravovat nasazení → tužka → oprav přístup → Nasadit. |
| Do tabulky se nic nezapsalo | Otevři adresu `/exec` v prohlížeči — musí vrátit `{"ok":true...}`. Zkontroluj taky `SHEET_ID` v prvním řádku skriptu. |
| Po úpravě skriptu se chová postaru | Apps Script běží ve verzi, která byla nasazená. Nasadit → Spravovat nasazení → tužka → Verze: **Nová verze**. |
| Ruční úpravy v listech zmizely | Listy se při každém odeslání přepisují celé. Vlastní výpočty si dej na samostatný list. |
| Po aktualizaci souborů se změny neprojeví | Service worker drží starou verzi. Zvyš `V` v `sw.js`, nebo appku smaž z plochy a přidej znovu. |

---

## 8. Kam to jde dál rozšířit

- Mezičasy pro jednoho běžce (rozdělení `splits` podle typu disciplíny — datový model to už umožňuje).
- Bodovací tabulky IAAF nebo školní normy místo pevných známkovacích hranic.
- Vývoj výkonu v čase jako graf u každého závodníka (historie se už ukládá).
- Družstva a součty bodů za štafety.
- Automatické načtení z tabulky při startu aplikace (teď se načítá jen na vyžádání, aby se nepřepsalo rozměřené měření).
- Nativní verze pro iOS ve SwiftUI — vyžaduje Mac s Xcode a každých 7 dní přeinstalování, pokud nemáš placený vývojářský účet. Datový model by šel převzít beze změny.
