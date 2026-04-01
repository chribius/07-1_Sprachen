# Klasse 7 — Web-Übungen (Scaffold)

Dieses Repository enthält ein kleines Scaffold für mehrere Single-Page-Apps (SPAs), die per GitHub Pages ausgeliefert werden können.

Ordnerstruktur (kurz):
- `apps/` — Entwicklung: jede App in einem eigenen Unterordner (z. B. `apps/html-grundlagen/`).
- `docs/` — Veröffentlichte Seite (GitHub Pages: Branch `main` / Ordner `/docs`).
- `.github/workflows/deploy.yml` — kopiert `apps/*` → `docs/*` auf jedem Push in `main`.

Wichtig:
- Jede App nutzt in der `index.html` ein `<base href="/...">`-Tag. Passe dieses an das tatsächliche Repo/Benutzer an — z. B. `/USERNAME/REPO-NAME/APP-FOLDER/`.
- Die Apps verwenden Hash-Routing (oder einfache client-seitige Navigation), damit Links auf GitHub Pages zuverlässig funktionieren.

Beispiel-Apps in `apps/`:
- `html-grundlagen` — kleine Editor-Sandbox mit Live-Vorschau.
- `html-quiz` — kurzes Multiple-Choice-Quiz.

Wie man veröffentlicht:
1. Aktiviere GitHub Pages in den Repo-Einstellungen: Branch `main`, Ordner `/docs`.
2. Push auf `main`. Der Workflow kopiert automatisch `apps/*` nach `docs/*`. Die Seite ist dann unter `https://<username>.github.io/<repo-name>/` erreichbar.

Tipps:
- Wenn du mehrere Klassen-Repos haben wirst, behalte die gleiche Struktur bei. Passe nur die `<base>` Pfade an.
- Für komplexere Builds (z. B. Webpack/Vite) kannst du das Workflow-Skript erweitern.
