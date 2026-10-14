# ACD Benelux – Partners

Webapp om partners (dealers, premium dealers, monteurs en ambassadeurs) in Nederland, België en Luxemburg te beheren en op een kaart te zien. Zo zie je meteen of een nieuwe partner te dicht bij een bestaande partner ligt, en welke concurrerende merken je partners nog verkopen.

De app draait volledig in de browser: er is geen server en je hoeft niets te installeren. Het is een aparte versie van de app voor Duitsland (ACD-Germany), met dezelfde werking.

## Openen

De app staat op GitHub Pages: **https://bas-derooij.github.io/ACD-BENELUX/**

Je partners worden **in de browser op je eigen computer** bewaard, niet online en niet op GitHub. Gebruik daarom regelmatig **Data → Back-up downloaden** en bewaar het bestand bijvoorbeeld op OneDrive. Met **Back-up terugzetten** zet je alles terug, ook op een andere computer of in een andere browser. De gegevens van de Benelux-app en de Duitse app staan los van elkaar, ook als je ze in dezelfde browser opent.

## Wat zit erin

- **Partners in de opmaak van de roadmap**: Categorie, Onderneming, Naam, Telefoonnummer, Mailadres, Website, Locatie (gemeente), Land, Provincie, Concurrerende merken, Status informatie, Volgende actie (met datum), Laatste bezoek, Demo-serre en Notitie. Optioneel ook straat en postcode.
- **Categorieën**, elk met een eigen kleur op de kaart (klik in de legende op een kleur om ze te wijzigen; je kunt ook zelf een nieuwe categorie intypen):

  | Categorie | Kleur |
  |---|---|
  | Dealer | lichtgroen |
  | Premium Dealer | oranje |
  | Certified Assembler | bruin |
  | Ambassadeur | roze |

- **Concurrerende merken**: per partner vink je aan welke andere merken hij nog verkoopt (Janssens, Euroserre, Fillclair, Royal Well, Juliana, Hoklartherm, KGT, Vitavia, Lams). Een ander merk typ je in bij *Ander merk toevoegen*; daarna staat het ook in de lijst. De merken staan in de lijst links, in de popup op de kaart, in de Excel-export, en je kunt **filteren op merk**.
- **Subcategorie en status** worden voorlopig niet getoond. Ze blijven wel bewaard in de gegevens (bv. uit een geïmporteerde roadmap), zodat ze later terug kunnen komen.
- **Land**: Nederland, België of Luxemburg, en ook Duitsland of Frankrijk voor dealers net over de grens. In de lijst staat het land achter de gemeente voor partners buiten Nederland, bv. "Antwerpen (BE)".
- **Kaart** met een donkergroene lijn rond Nederland, België en Luxemburg en lijnen op de grenzen ertussen. Elke partner is een pin in de kleur van zijn categorie. Een **rode stippelring** betekent *te dicht bij een andere partner*; een **klein cijfer** naast een pin betekent meerdere partners op dezelfde plek.
- **Zoekbalk bovenaan**: zoek een gemeente of postcode. Je ziet de dichtstbijzijnde partners, een cirkel met de minimale afstand, en je kunt er meteen een nieuwe partner aanmaken.
- **Filters** voor categorie en concurrerend merk (meerdere tegelijk aan te vinken) en **✕ Filters wissen**.
- **Tabblad "Te dichtbij"**: alle paren partners die dichter dan de minimale afstand (standaard 50 km) bij elkaar liggen. Je kiest per categorie wie meetelt (standaard Dealer en Premium Dealer). Dealers en premium dealers worden onderling vergeleken voor "dichtstbijzijnde dealer".
- **Activiteitenlog** per partner.

## Data-menu

- **Exporteren naar Excel…**: Excel-bestand in de opmaak van de roadmap, per categorie.
- **Importeren uit roadmap (Excel)…**: leest een roadmap-bestand in (kolom Onderneming verplicht). Alle rijen met een onderneming worden toegevoegd; een kolom *Concurrerende merken* (merken gescheiden door komma's) wordt ook ingelezen. Daarna zoekt de app automatisch de locatie van elke gemeente.
- **Ontbrekende locaties zoeken**, **Back-up downloaden / terugzetten**, **Alle partners verwijderen…** (met automatische back-up).

Locaties worden opgezocht via OpenStreetMap (Nominatim), in Nederland, België, Luxemburg, Duitsland en Frankrijk. Daarbij worden alleen de gemeente, postcode of het adres verstuurd, nooit namen of contactgegevens. **Zet nooit je roadmap, exports of back-ups in deze repository.**

## GitHub Pages

De repository moet **openbaar** zijn (alleen de code, niet de partners). Onder **Settings → Pages** staat *Deploy from a branch*, branch **main**, map **`/docs`**.

## Ontwikkeling

De site staat in `docs/` (`index.html`, `style.css`, `app.js`, `store.js`, `roadmap.js`, `borders.js`, `vendor/` met Leaflet en ExcelJS).

- Lokaal draaien: `python3 -m http.server --directory docs 8000` en open http://localhost:8000.
- Tests: `npm install` en `npm test`.
- Grenslijnen opnieuw maken: `npm run build:border` (Natural Earth, publiek domein).

Afstanden zijn in vogelvlucht, niet over de weg.
