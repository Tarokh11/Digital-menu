# Project Guide: Digital Menu

## 1. Project overview

This repository contains a Persian-language, right-to-left digital menu for a
juice and ice-cream shop. It is a small Django application with server-rendered
templates and plain CSS and JavaScript. The landing page introduces the shop;
the menu page presents products with category filtering, product search, and
selectable product cards.

The current shop name and sample product information are placeholders. Update
them with the shop's approved branding, descriptions, images, and prices before
using the site as a live menu.

## 2. Technology

- **Backend:** Python 3.12 and Django 5.x.
- **Rendering:** Django views and templates; there is no frontend build step.
- **Frontend:** HTML, CSS, and vanilla JavaScript.
- **Static files:** Django staticfiles with WhiteNoise compressed manifest
  storage for deployment.
- **Database:** SQLite configured by Django. Menu products are currently held
  in a Python constant, not in the database.
- **Serving:** Gunicorn in the Docker image; Docker Compose for local and server
  runs.
- **Deployment:** GitHub Actions workflow `.github/workflows/deploy.yml`, which
  deploys pushes to `main` over SSH when repository secrets are configured.

## 3. Repository map

```text
.
├── manage.py                         # Django management commands
├── restaurant/
│   ├── settings.py                   # Settings and environment configuration
│   ├── urls.py                       # Application routes
│   └── wsgi.py                       # Gunicorn WSGI entry point
├── menu/
│   ├── views.py                      # Shop name, product data, page views
│   ├── tests.py                      # Homepage and menu rendering tests
│   └── static/menu/
│       ├── menu.css                  # Site styles
│       ├── menu.js                   # Menu search, filtering, and selection
│       ├── start-background.png      # Landing-page artwork
│       └── assets/                   # Product and decorative artwork
├── templates/
│   ├── layouts/base.html             # Shared RTL HTML shell
│   ├── pages/home.html               # Landing page
│   └── menu/index.html               # Product menu page
├── Dockerfile
├── docker-compose.yml
├── .env.example                      # Safe local environment template
└── requirements.txt
```

## 4. Routes and request flow

| Path | Name | Purpose |
| --- | --- | --- |
| `/` | `home` | Landing page with a link to the menu |
| `/menu/` | `menu` | Searchable, filterable product menu |

`restaurant/urls.py` maps these paths to views in `menu/views.py`. The views
prepare a small template context and render pages from `templates/`. Both pages
extend `templates/layouts/base.html`, which sets Persian language metadata,
right-to-left direction, and includes the shared stylesheet.

The menu view groups `MENU_DATA` using `CATEGORY_ORDER`. The menu template
renders these groups and product options with `data-*` attributes. The browser
script in `menu/static/menu/menu.js` uses those attributes to filter products by
category or search text, update the featured product, and respond to horizontal
product-rail scrolling. Menu behavior is progressive client-side interaction;
the product content itself is rendered by Django.

## 5. Editing menu content and artwork

Product records, category order, and the shop name are currently defined at the
top of `menu/views.py`:

- `MENU_DATA` is a list of dictionaries. Each product has a name, description,
  price, category, and static image path; `badge` is optional.
- `CATEGORY_ORDER` controls the order and labels of menu sections and category
  buttons. Ensure each product category matches one of these entries.
- `SHOP_NAME` is passed to templates for the document title and page context.

Product image paths refer to files under `menu/static/`. Add artwork there and
use its path relative to the static directory, for example
`menu/assets/products/mango.png`. The landing-page background currently lives at
`menu/static/menu/start-background.png`.

For a small static menu, keeping content in Python is straightforward. If shop
staff need to update products without code changes, consider adding Django
models, migrations, and an admin workflow.

## 6. Local development

### Docker (recommended)

Create a local environment file and start the service:

```sh
cp .env.example .env
# Set a private DJANGO_SECRET_KEY and adjust local values as needed.
docker compose up --build
```

Open <http://127.0.0.1:8002/> for the landing page and
<http://127.0.0.1:8002/menu/> for the menu, unless `HOST_PORT` in `.env` has
been changed. SQLite data is persisted in the Compose named volume selected by
`SQLITE_VOLUME`.

Useful commands:

```sh
docker compose up -d --build
docker compose run --rm web python manage.py test
docker compose exec -T web python manage.py check
docker compose ps
docker compose logs -f web
docker compose down
```

### Without Docker

Install the Python dependencies and start Django's development server:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
DJANGO_DEBUG=1 python manage.py runserver
```

The default development URL is <http://127.0.0.1:8000/>. Set environment
variables as needed; see `.env.example` for the available application and
Compose values. Django does not automatically load `.env` files in a direct
Python run, so export those values in your shell or use a local environment
loader if desired. With `DJANGO_DEBUG=1`, Django serves current source static
files during development; production uses WhiteNoise's collected static files.

## 7. Configuration and deployment

`restaurant/settings.py` reads these application variables:

| Variable | Purpose |
| --- | --- |
| `DJANGO_SECRET_KEY` | Django secret key; provide a private random value |
| `DJANGO_DEBUG` | Enables debug mode only when set to `1` |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated allowed hostnames |
| `SQLITE_PATH` | Optional SQLite database path; Compose sets it to `/data/db.sqlite3` |

Docker Compose additionally uses `HOST_PORT` (default `8002`) and
`SQLITE_VOLUME` (default `digital_menu_data`). The checked-in `.env.example` is
for local setup only. Keep real secrets in an ignored `.env` or deployment
secret store; never commit them.

The production workflow is triggered by pushes to `main` or manually from
GitHub Actions. Configure the `digital-menu` GitHub Actions environment with
`SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, and `DEPLOY_PATH`; `SERVER_PORT`
is optional and defaults to port 22. The server must have Git, Docker Compose,
the repository deployment path, production environment configuration, and an
HTTPS reverse proxy as appropriate. The workflow fetches `main`, builds the
image, runs tests, restarts the service, and runs Django's deployment check.

## 8. Tests and checks

Run the test suite with:

```sh
python manage.py test
```

The tests cover the landing page's Persian RTL markup and menu link, menu
categories and search markup, and the expected number of rendered product
cards. Run Django's configuration check with:

```sh
python manage.py check
```

Before deployment, also run `python manage.py check --deploy` with production
settings and deployment environment variables configured.

## 9. Development conventions

- Keep user-facing content and markup Persian and preserve `lang="fa"` and
  `dir="rtl"` unless the product requirements change.
- Keep static files under `menu/static/menu/` and reference them through Django's
  `{% static %}` template tag.
- Keep route names and template usage aligned with `restaurant/urls.py` and the
  existing templates.
- When changing menu markup or interaction attributes, check that the selectors
  in `menu/static/menu/menu.js` still match the template.
- Run the tests after meaningful changes to page rendering or menu behavior.
- Check `git status` before committing and commit only intentional source files;
  keep `.env`, generated static output, Python caches, and local database files
  out of version control.
