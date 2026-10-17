# Interactive portfolio

The homepage on `personal_page` is a Persian portfolio with six projects per gallery page. All 16 previous destinations remain in the catalogue. Other menu routes keep their own styles and behavior.

## Update projects

`menu/portfolio.py` contains the project name, category, destination, portal color, introduction and three feature statements. Each project uses two actual screenshots under `menu/static/menu/portfolio/projects/`: `<slug>-desktop.jpg` (1365 × 900) and `<slug>-mobile.jpg` (390 × 844).

The server renders working live-site anchors, then `portfolio.js` enhances them with filtering, paging, CSS 3D chambers, GSAP/Draggable interactions and a native modal project reveal. Add a project with a unique slug and both screenshots. Set the total label in the template and update the existing catalogue test when the number of projects changes.

## Interaction

- Hover or keyboard focus raises the preview and reveals the portal.
- Drag right to the portal and release to open the project introduction. A short or leftward drag returns the preview.
- Click/tap the image or the arrow button to reach the same introduction.
- Vertical touch gestures continue to scroll the page.
- The reveal shows desktop/mobile screenshots, three features, a live-site link and a contextual WhatsApp link.
- Escape or the return button closes the reveal and restores focus.
- `#project-<slug>` links open that project's reveal directly.
- Reduced-motion preferences skip the suction/zoom transition. Without JavaScript, all project images remain direct links to their live sites.

Contact links currently use WhatsApp `+98 9194131050` and `tarokhh101@gmail.com`, as supplied by the owner. They are in `templates/pages/home.html`; the contextual WhatsApp message is in `portfolio.js`.

## Dependencies and validation

GSAP core and Draggable **3.15.0** are pinned and served from `menu/static/menu/vendor/gsap/`. Copyright notices and the official license link are retained. There is no browser CDN dependency or frontend build step.

Run `.venv/bin/python manage.py test` for existing Django checks. For local previews, set `DJANGO_DEBUG=1` and run `.venv/bin/python manage.py runserver 127.0.0.1:8763`. Browser checks should cover rightward drag, cancelled drag, tap, keyboard focus/escape, pagination/filtering, reduced motion, image loading and horizontal overflow at mobile widths.

The repeatable browser suite is `scripts/test_portfolio_browser.py`. Install Playwright in a development environment (`pip install playwright` and `playwright install chromium`), start the local server, then run `python scripts/test_portfolio_browser.py --base-url http://127.0.0.1:8763/`. It writes screenshots and a JSON report to `/tmp/portfolio-browser-checks`. `--output-dir` and `--browser-executable` can select another artifact directory or an existing Chromium binary.
