# Kända problem

Tvärgående punkter som fortfarande är öppna när bygget är klart (plan §4.3). Fas-lokala noteringar ligger kvar i respektive `docs/log/<fas>.md`.

Sammanställd av S9:s link pass. Ordnad efter vad som gör mest skada om det inte åtgärdas.

---

## 1. Varenda siffra är overifierad mot källan

**Alla 22 skattekonstanter i `src/lib/tax/constants.ts` har `verified: false`.** Sandlådans egress-proxy svarar 403 på CONNECT till `skatteverket.se`, `bolagsverket.se` och `verksamt.se` — bekräftat av O1, O2, O3 och S5 var för sig. Ingen byggsession har kunnat öppna en enda myndighetssida.

Formen är rätt, kronorna är inte bekräftade. Det här är den enskilt viktigaste punkten före lansering: sajtens hela löfte är "siffror med källa och datum".

Mest osäkra posterna, i den ordningen:

- **3:12-reglerna för 2026.** Förenklingsregeln och huvudregeln har ersatts av en regel med ett grundbelopp på 4 inkomstbasbelopp (322 400 kr). Reformen är ny och andrahandskällorna var inte överens om schablonbeloppet. Kontrollera denna först.
- **Grundavdrag och jobbskatteavdrag** är approximationer, inte Skatteverkets tabeller. Verktyg 3 säger det i sina antaganden och länkar ut. Att byta in de riktiga tabellerna är en avgränsad ändring i `src/lib/tax/income.ts`.
- **Bolagsverkets avgifter** ändrades 19 juni 2025. `bolagsverket-ab-nyregistrering` är satt till 2 200 kr.

**Nästa steg:** öppna varje konstants `source`-URL från en vanlig webbläsare, rätta värdet om det skiljer, sätt `verified: true` och `verifiedOn` till dagens datum.

## 2. Inga jämförelsepriser är kontrollerade mot leverantörens egen prissida

Samma 403 blockerar varje leverantörsdomän: bokio.se, fortnox.se, vismaspcs.se, wint.se, bjornlunden.se, shopify.com, wikinggruppen.se, quickbutik.com, woocommerce.com, loopia.se, one.com, hostinger.se, misshosting.se, bankernas och försäkringsbolagens sidor.

Varje jämförelserad bär leverantörens URL och ett datum, men ingen rad anger en bekräftad siffra. Marknadsprisraderna i verktyg 2 (bank, bokföringsprogram, försäkring, webbhotell, e-handel) är intervall av samma skäl.

**Nästa steg:** öppna varje rads `sourceUrl` och fyll i riktiga priser innan lansering. Det är sex jämförelsesidor.

## 3. `content/legacy-urls.json` är ofullständig — och tretton slugs är gissningar

Filen är fortfarande `"complete": false` med 27 av 48 WordPress-sökvägar (plan §7 punkt 1). Sandlådan når inte `startaegetforetag.se`, så ingen session har kunnat hämta sitemapen.

Följande artikel-slugs är skrivna efter plan §6, inte efter den riktiga exporten, och kan ha fel sökväg — vilket betyder att rankingen på den gamla URL:en tappas:

`enskild-firma` · `stod-till-nytt-foretag` · `foretagslan` · `affarsplan` · `affarsplan-exempel` · `affarsplan-mall` · `doman` · `webshop` · `konverteringsoptimering` · `google-ads` · `sociala-medier` · `instagram-marknadsforing` · `ai-byra`

**Nästa steg:** exportera sökvägslistan ur WP-admin (Inlägg, eller `wp-sitemap-posts-post-1.xml`), fyll på filen, sätt `"complete": true` och rätta varje slug som skiljer. `verify.mjs` varnar tills flaggan vänds.

## 4. Affärsmodellen är inte inkopplad

- **Inget affiliateprogram är anslutet.** Alla 27 partner i `content/affiliates.ts` har tom `affiliateUrl`, så varje `/go/<id>/` går till den vanliga fallback-länken. `Annonslank` och `PartnerCta` visar ändå partnerns "Annonslänk"-märkning ovillkorligt, enligt det uttryckliga beslutet i plan §1.8. När `affiliateUrl` fylls i ändras destinationen och länken får `rel="sponsored nofollow noopener"`; den synliga märkningen är redan på. Detta är sajtens transparenspolicy för partnerslots, inte ett påstående att en fallback-länk redan ger ersättning eller i sig måste annonsmärkas enligt lag (§1.2 kräver märkning av affiliatelänkar).
- **Annonspolicyn har en kvarvarande motsägelse.** `content/pages/annonspolicy.mdx` säger först att märkningen alltid är på, men under "Vad som styr vilka leverantörer vi visar" står att leverantörer utan aktivt ersättningsprogram länkas utan märkning. Det senare stämmer inte med partnerslotsens beslutade beteende. Filen ligger utanför denna ändrings tillåtna filurval och har inte ändrats.
- **Ingen e-post skickas.** `/api/subscribe` och `/api/tool-result` sparar raden men skickar inget utan `RESEND_API_KEY`, så dubbel opt-in för nyhetsbrevet finns inte ännu (plan §7 punkt 4).
- **Org.nr och postadress saknas** i `kontakt.mdx` och `integritetspolicy.mdx` (plan §7 punkt 6). Ingen påhittad adress användes — sidorna säger att uppgifterna publiceras när de finns.

## 5. Bloggadmin behöver GitHub-konfiguration för beständiga ändringar i drift

Plan §7 punkt 10–12: `ADMIN_PASSWORD` och `ADMIN_SESSION_SECRET` behövs för admininloggningen. GitHub-lagring kräver både en fine-grained `GITHUB_TOKEN` med *Contents: read/write* på bara detta repo och `GITHUB_REPO` (`ägare/repo`); `GITHUB_BRANCH` är valfri och har standardvärdet `main`. **Utan token eller repo väljer `src/lib/admin/store.ts` en skrivbar lokal diskbackend även i produktion.** Den kan skapa, ändra och radera artiklar under `content/articles` om processens filrättigheter tillåter det; validering gäller fortfarande för skrivningar. Ändringarna sparas bara på serverns disk, inte i git, och överlever inte en Hostinger-redeploy som ersätter innehållet från repot. En lyckad lokal sparning innebär inte heller att redan statiskt byggda publika sidor har byggts om.

Dessutom:

- `NEXT_PUBLIC_BUILD_SHA` måste sättas av byggkommandot (`NEXT_PUBLIC_BUILD_SHA=$(git rev-parse HEAD)`); inget i repot kan sätta den för Hostinger.
- GitHub-backenden är testad mot en stubbad `fetch`, inte mot det riktiga API:et — sandlådan når inte `api.github.com` och har ingen token.
- Bekräfta att Node-slotten autodeployar vid push till `main`. Gör den inte det kräver varje admin-sparning en manuell "Redeploy".

## 6. Innehåll som behöver en mänsklig läsning

- **`bokforing-dropshipping`** hedgar medvetet om importmoms och EU:s gränsöverskridande konsumentmoms — inga påhittade trösklar eller ordningsnamn. Markerad i artikeln med en varnings-Callout och en `<Verifiera />`. Värd en riktig revisorsgenomgång.
- **`basta-kassasystem`** beskriver kravet på kassaregister och kontrollenhet bara i allmänna termer; undantagströsklarna är inte verifierade.
- **`webshop`, `ehandel` och `starta-webshop` — granskade 2026-09-15: betydande innehållsöverlapp, särskilt mellan `ehandel` och `starta-webshop`.** Olika avsikter i frontmatter räcker inte för att skilja brödtexterna:
  - Plattform: `webshop` → "Plattformen: butikens skelett", `ehandel` → "Välj plattform utifrån var du redan är" och `starta-webshop` → steg 3 upprepar månadsbetald SaaS kontra egen drift, uppdateringar och säkerhetsansvar.
  - Betalning: `webshop` → "Betalningslösningen: att faktiskt få betalt", första stycket i `ehandel` → "Betalningar och att sälja utanför Sverige" och båda styckena i `starta-webshop` steg 4 ger samma råd om kort/Swish/faktura, fast avgift plus procentsats och marginal efter frakt.
  - Lager: `ehandel` → "Eget lager, dropshipping eller fulfillment" och `starta-webshop` steg 6 har nästan samma tre förklarande stycken om eget lager, dropshipping och fulfillment, inklusive säljarens returansvar och fulfillmentavgiftens effekt på billiga produkter. `webshop` → "Lager, dropshipping eller fulfillment" komprimerar samma resonemang till en checklista; slutstycket om att börja med eget lager och kombinera upplägg återkommer i alla tre.
  - Leverans/kundkontakt: `webshop` → "Frakt och leverans: löftet du måste hålla" och "Kundservice: den delen som säljer tyst", `ehandel` → "Vad kunderna faktiskt bryr sig om" samt `starta-webshop` steg 5 upprepar tydligt fraktpris och hållbara leveranslöften; de två första upprepar även bemannad telefon/chatt som förtroendesignal.
  - Juridik: `webshop` → "Integritetspolicy, ångerrätt och prisinformation", `ehandel` → "Det här krävs innan första ordern" och `starta-webshop` steg 7 upprepar ångerrätt, integritetspolicy och totalpris inklusive moms/frakt. Lagerfrågan i alla tre FAQ ger också samma svar.
  - Nära dubblerade formuleringar: de inledande bolagsforms-Callout-rutorna i `ehandel` och `starta-webshop`; styckena "Att räkna fel på marginalen efter frakt och avgifter" och "Att skjuta upp momsregistreringen" i deras respektive avslutande misstagsavsnitt; samt prisvarningsrutorna.
  - Eget värde finns kvar: `webshop` förklarar delarnas beroenden och gratis kontra betalda delar; `ehandel` har EU-försäljning/OSS och bokföringsflöden; `starta-webshop` har ordnad lanseringssekvens, testorder, mjuk lansering och marknadsföring efter test. Slutsats: tydlig redaktionell upprepning, inte tre identiska artiklar. En framtida innehållsredigering kan behålla dessa roller och korta de gemensamma förklaringarna med korslänkar. Artiklarna har inte ändrats; granskningen verifierar inga juridiska uppgifter, momsbelopp eller priser.
- **`foretagsforsakring`** anger Konsumenternas Försäkringsbyrå som källa; den exakta URL:en kunde inte kontrolleras från sandlådan.

## 7. Små tekniska skulder

- **`related` och `partners` i adminen är checkbox-listor över samtliga artiklar och partner** (61 och 27 idag). Rimligt i den här storleken, trångt vid tre gånger så mycket.
- **Watcher-Routinen skrev aldrig `docs/log/_watcher.md`**, så dess egen spärr ("efter 10 körningar: meddela och stäng av") räknade inte. Routinen är raderad sedan S9 mergades.

---

## Det som inte är ett problem längre

Städat under bygget, listat här så ingen jagar dem igen:

- `<Stat k="…">` finns nu (B1). S5:s notering att komponenten saknades är löst.
- `content/lead-magnets/` har en loader och egna routes (B1). `/affarsplan-mall/` och `/startkostnads-checklista/` svarar 200.
- De sju `content/pages`-sidorna finns (S8), så footerns länkar 404:ar inte längre.
- `hub.featured` var tom för sex hubbar; S9 satte hörnstensartikeln i varje.
- `src/lib/content/README.md` är uppdaterad: `content/lead-magnets/`, `gate`, `type: post`, `blogg`-hubben och hela komponentlistan inklusive `<Stat k>`.
- Hubbens sifferpanel säger "inlägg" på `/blogg/` i stället för "guide". Etiketten härleds nu ur artiklarnas `type`, så en ny hub märker sig själv.
- Verktygens och adminens e2e-pass körs i CI, i jobbet som redan har Chromium (`npm run test:tools` / `test:admin` lokalt).
- `starta-aktiebolag.mdx` angav 2 400 kr för AB-registreringen. Redan rättad till 2 200 kr i PR #6 — S4:s notering i `docs/decisions-needed.md` var förlegad när S9 kom dit.
- `affarsideer.mdx` lovade "56 affärsidéer" men listar 55. Siffran rättad av S9 (beskrivning och StatRow).
