# ACD Benelux – Leads

Webapp om leads (potentiële dealers, ambassadeurs, monteurs, beurzen, …) in Nederland, België en Luxemburg te beheren en op een kaart te zien. Zo zie je meteen of een nieuwe lead te dicht bij een bestaande dealer of lead ligt.

De app draait volledig in de browser: er is geen server en je hoeft niets te installeren. Het is een aparte versie van de app voor Duitsland (ACD-Germany), met dezelfde werking.

## Openen

De app staat op GitHub Pages: **https://bas-derooij.github.io/ACD-BENELUX/**

Je leads worden **in de browser op je eigen computer** bewaard, niet online en niet op GitHub. Gebruik daarom regelmatig **Data → Back-up downloaden** en bewaar het bestand bijvoorbeeld op OneDrive. Met **Back-up terugzetten** zet je alles terug, ook op een andere computer of in een andere browser. De leads van de Benelux-app en de Duitse app staan los van elkaar, ook als je ze in dezelfde browser opent.

## Wat zit erin

- **Leads in de opmaak van de roadmap**: Categorie, Subcategorie, Onderneming, Naam, Telefoonnummer, Mailadres, Website, Locatie (gemeente), Land, Provincie, Status, Status informatie, Volgende actie (met datum), Laatste bezoek, Demo-serre en Notitie. Optioneel ook straat en postcode.
- **Categorie en subcategorie** (voorlopig dezelfde indeling als de Duitse app; je kunt zelf een nieuwe categorie of subcategorie intypen):

  | Categorie | Subcategorie |
  |---|---|
  | Dealer | Gartencenter, GaLa Bau, Gespecialiseerd, Online retailer |
  | Certified Assembler | Monteur, Monteur-verkoper |
  | Ambassadeur | (geen) |
  | Beurs | Bezoek, Deelname (alleen zichtbaar in de categoriefilter, niet in de legende) |

- **Status = kleurcode**: 🟠 Gesprek, 🟢 Samenwerking, 🔴 Geen samenwerking.
- **Land**: Nederland, België of Luxemburg, en ook Duitsland of Frankrijk voor dealers net over de grens. In de lijst staat het land achter de gemeente voor leads buiten Nederland, bv. "Antwerpen (BE)".
- **Kaart** met een donkergroene lijn rond Nederland, België en Luxemburg en lijnen op de grenzen ertussen. Elke lead is een pin: de **vulling** is de kleur van de subcategorie (klik in de legende op een kleur om ze te wijzigen), de **rand** is de status. Een **rode stippelring** betekent *te dicht bij een andere lead*; een **klein cijfer** naast een pin betekent meerdere leads op dezelfde plek.
- **Zoekbalk bovenaan**: zoek een gemeente of postcode die nog geen lead is. Je ziet de dichtstbijzijnde leads, een cirkel met de minimale afstand, en je kunt er meteen een nieuwe lead aanmaken.
- **Filters** voor categorie en status (meerdere tegelijk aan te vinken) en **✕ Filters wissen**.
- **Tabblad "Te dichtbij"**: alle paren leads die dichter dan de minimale afstand (standaard 50 km) bij elkaar liggen. Je kiest per (sub)categorie en per status wie meetelt.
- **Activiteitenlog** per lead.

## Data-menu

- **Exporteren naar Excel…**: Excel-bestand in de opmaak van de roadmap, per categorie of subcategorie.
- **Importeren uit roadmap (Excel)…**: leest een roadmap-bestand in (kolom Onderneming verplicht). Alleen **groene en oranje** rijen in de kolom Status worden toegevoegd. Daarna zoekt de app automatisch de locatie van elke gemeente.
- **Ontbrekende locaties zoeken**, **Back-up downloaden / terugzetten**, **Alle leads verwijderen…** (met automatische back-up).

Locaties worden opgezocht via OpenStreetMap (Nominatim), in Nederland, België, Luxemburg, Duitsland en Frankrijk. Daarbij worden alleen de gemeente, postcode of het adres verstuurd, nooit namen of contactgegevens. **Zet nooit je roadmap, exports of back-ups in deze repository.**

## GitHub Pages

De repository moet **openbaar** zijn (alleen de code, niet de leads). Onder **Settings → Pages** staat *Deploy from a branch*, branch **main**, map **`/docs`**.

## Ontwikkeling

De site staat in `docs/` (`index.html`, `style.css`, `app.js`, `store.js`, `roadmap.js`, `borders.js`, `vendor/` met Leaflet en ExcelJS).

- Lokaal draaien: `python3 -m http.server --directory docs 8000` en open http://localhost:8000.
- Tests: `npm install` en `npm test`.
- Grenslijnen opnieuw maken: `npm run build:border` (Natural Earth, publiek domein).

Afstanden zijn in vogelvlucht, niet over de weg.
