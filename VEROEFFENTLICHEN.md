# Hinses Battlefield 2 separat veröffentlichen

Diese Version ist absichtlich ein eigenes Projekt. Das bestehende Repository und die bestehende Vercel-Seite von Version 1 werden nicht ersetzt.

## Aktueller Stand

- Live-Spiel: https://hinses-battlefield-2.vercel.app
- GitHub: https://github.com/Hinse77/hinses-battlefield-2
- Automatische Veröffentlichung: Jeder Push auf `main` startet künftig selbstständig einen neuen Vercel-Build.
- Noch offen: Ein eigener Upstash-Speicher muss einmalig mit dem Vercel-Projekt verbunden werden, damit Ranglisten und Statistiken browserübergreifend geteilt werden. Ohne ihn funktioniert das Spiel vollständig, speichert diese Daten aber nur im jeweiligen Browser.

## Einmalig: GitHub Desktop installieren

Installiere GitHub Desktop von https://desktop.github.com und melde dich mit deinem GitHub-Konto an.

## Projekt zu deinem vorhandenen GitHub-Repository hochladen

1. Lade das ZIP-Paket herunter und entpacke es, zum Beispiel auf den Desktop.
2. Öffne GitHub Desktop und wähle **File → Clone repository**.
3. Erstelle beziehungsweise wähle ein neues Repository `Hinse77 / hinses-battlefield-2` und klicke **Clone**.
4. Öffne den geklonten Ordner im Explorer.
5. Kopiere den gesamten Inhalt des entpackten ZIP-Pakets in diesen geklonten Ordner. Wenn Windows nachfragt, wähle **Dateien ersetzen**.
6. Öffne GitHub Desktop wieder. Dort siehst du die Änderungen automatisch.
7. Gib unten als Beschreibung `Spiel veröffentlichungsbereit` ein und klicke **Commit to main**.
8. Klicke oben auf **Push origin**.

Wichtig: Nicht einzelne Dateien im GitHub-Browser hochladen. Das ZIP enthält die Ordner `src`, `public` und `api` bereits richtig. Der Ordner `api` ist nötig für Rangliste, Gästebuch und Nutzungsstatistik.

## Bei Vercel veröffentlichen

1. Öffne https://vercel.com und melde dich mit GitHub an.
2. Klicke **Add New → Project**.
3. Wähle das Repository `hinses-battlefield-2` und klicke **Import**.
4. Vercel erkennt das Projekt automatisch. Falls eine Einstellung angezeigt wird: **Framework Vite**, **Build Command `npm run build`**, **Output Directory `dist`**.
5. Klicke **Deploy**.
6. Nach kurzer Zeit zeigt Vercel einen Link zu deinem Spiel. Diesen Link kannst du teilen.

## Einmalig: gemeinsame Rangliste aktivieren

1. Öffne in Vercel dein Projekt und wähle **Storage**.
2. Klicke **Create Database** und wähle **Upstash Redis** aus dem Marketplace.
3. Wähle den kostenlosen Startplan und verbinde ihn ausschließlich mit `hinses-battlefield-2`. Eine vorhandene Upstash-Datenbank kann technisch wiederverwendet werden, weil 2.0 eigene Schlüssel verwendet; ein eigener Store ist für maximale Trennung dennoch übersichtlicher.
4. Starte in Vercel anschließend einen neuen Deploy über **Deployments → Redeploy**.

Vercel fügt die benötigten Zugangsdaten automatisch ein. Danach teilen alle Spieler dieselbe Hall of Fame, getrennt nach Schwierigkeit. Die neue **Service-Rangliste** nutzt dieselbe Einrichtung: Rangpunkte werden pro Spielername über alle abgeschlossenen Runden gesammelt; der Fortschritt und die zehn Ränge erscheinen im Spiel. Im Bereich **Best Of** erscheint zusätzlich die anonyme Arena-Aktivität: eindeutige Spielsitzungen sowie gestartete und abgeschlossene Runden und die häufigsten Länder. Namen und IP-Adressen werden dafür nicht gespeichert.

Die interne Balance-Auswertung wird ebenfalls automatisch aktiviert. Sie führt für **Easy, Normal, Hard und Very Hard getrennt** anonyme Summen zu Siegquote, Rundenzeit, Endmasse, Druckphase, Combos, Bossbesiegen sowie Gift- und Chaotic-Schaden. So lassen sich spätere Spielanpassungen mit echten Runden begründen.

## Arena-Codes mit Freunden nutzen

Nach einer beendeten Runde erscheint in der Abschlussansicht **Copy arena code**. Teile den erzeugten Code mit Freunden; sie tragen ihn auf dem Startbildschirm in **Arena code** ein. Der Code übernimmt die passende Schwierigkeit und erzeugt dieselbe Ausgangsarena mit gleicher Nahrung-, Gegner- und Bossverteilung. Die Runden bleiben trotzdem echte Herausforderungen, weil Bewegung, Fähigkeiten und Entscheidungen nicht vorgegeben sind.

## Community-Statistiken öffnen

1. Aktiviere Upstash Redis wie oben beschrieben und veröffentliche das Spiel einmal neu.
2. Öffne die Startseite des Spiels und klicke fünfmal schnell auf das Planetenlogo.
3. Die **Community overview** öffnet sich direkt – ohne Passwort.

Sie zeigt anonym Arena-Besucher, Starts, Abschluss- und Siegquote, Schwierigkeitsverteilung, Länder sowie die Balance-Signale pro Stufe. Namen und IP-Adressen werden nicht gespeichert.

## Gästebuch

Auf dem Startbildschirm gibt es den Button **Guestbook**. Spieler können dort einen Namen und einen kurzen englischen Kommentar oder Verbesserungsvorschlag hinterlassen. Die letzten Einträge sind für alle sichtbar. Eine unsichtbare Bot-Falle, eine Wartezeit von 45 Sekunden pro Browser und ein gemeinsames Limit von 30 Beiträgen pro fünf Minuten schützen das Gästebuch vor einfachem Spam.

Jede spätere Änderung: In GitHub Desktop **Commit** und **Push origin** klicken. Vercel veröffentlicht die neue Version dann automatisch.
