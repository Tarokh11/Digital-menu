# Digital Menu

A Persian, right-to-left digital-menu website built with Django, reusable
templates, and plain HTML/CSS. The landing page is designed mobile-first; its
replaceable background image is `menu/static/menu/start-background.png`. The
`PROJECT_GUIDE.md` documents the current project structure, development setup,
menu data, tests, and deployment configuration.

## Local development

With Docker:

```sh
cp .env.example .env
docker compose up --build
```

Open <http://127.0.0.1:8002/> for the start page or
<http://127.0.0.1:8002/menu/> for the sample menu. To run without Docker, install
`requirements.txt`, then run `python manage.py runserver`.

The menu page includes client-side Persian search and category filtering. Its
product artwork and visual references are stored in `menu/static/menu/assets/`.

## Tests

```sh
python manage.py test
```

Menu items and the temporary shop name are in `menu/views.py`; update them with
the shop's real information and prices.
