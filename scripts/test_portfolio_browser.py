import json
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser(description='Exercise the portfolio gallery in Chromium.')
parser.add_argument('--base-url', default='http://127.0.0.1:8763/')
parser.add_argument('--output-dir', default='/tmp/portfolio-browser-checks')
parser.add_argument('--browser-executable', default=None)
args = parser.parse_args()
BASE = args.base_url.rstrip('/') + '/'
OUT = Path(args.output_dir)
OUT.mkdir(parents=True, exist_ok=True)
RESULTS = []
ERRORS = []

def record(label, assertion):
    assert assertion, label
    RESULTS.append(label)
    print('PASS', label, flush=True)

def wait_dialog(page):
    page.wait_for_function('document.querySelector("dialog").open')
    page.wait_for_timeout(600)

def close_dialog(page):
    page.keyboard.press('Escape')
    page.wait_for_function('!document.querySelector("dialog").open')

def drag(page, locator, delta):
    box = locator.bounding_box()
    x, y = box['x'] + box['width'] * .45, box['y'] + box['height'] * .5
    page.mouse.move(x, y)
    page.mouse.down()
    page.mouse.move(x + delta, y - 4, steps=18)
    page.wait_for_timeout(120)
    page.mouse.up()

with sync_playwright() as p:
    launch_options = {'headless': True}
    if args.browser_executable:
        launch_options['executable_path'] = args.browser_executable
    browser = p.chromium.launch(**launch_options)
    context = browser.new_context(viewport={'width':1366,'height':768}, ignore_https_errors=True)
    page = context.new_page()
    page.on('pageerror', lambda error: ERRORS.append(str(error)))
    page.goto(BASE, wait_until='networkidle')
    page.wait_for_timeout(800)
    record('six projects on the first gallery page', page.locator('.project-card:visible').count() == 6)
    record('GSAP and Draggable loaded locally', page.evaluate('gsap.version === "3.15.0" && !!Draggable'))
    page.screenshot(path=str(OUT / 'final-desktop.png'), full_page=True)
    first = page.locator('.project-card').first
    first.hover()
    page.wait_for_timeout(600)
    record('portal appears on hover', first.locator('.portal').evaluate('e => +getComputedStyle(e).opacity') > .9)
    record('preview is a 3D layer', first.locator('.preview-lift').evaluate('e => getComputedStyle(e).transform.startsWith("matrix3d")'))
    page.screenshot(path=str(OUT / 'final-hover.png'))

    # A normal link activation stays in the portfolio until the live-site CTA.
    first.locator('.project-preview').click()
    wait_dialog(page)
    record('image click opens introduction', page.locator('#reveal-title').inner_text() == 'فروشگاه نورا')
    page.wait_for_function('["reveal-desktop-image","reveal-mobile-image"].every(id=>{let i=document.getElementById(id);return i.complete&&i.naturalWidth>0})')
    record('both real screenshots load', True)
    record('three project features appear', page.locator('#reveal-features li').count() == 3)
    record('contextual WhatsApp uses owner number', 'wa.me/989194131050?text=' in page.locator('#reveal-commission').get_attribute('href'))
    page.screenshot(path=str(OUT / 'final-reveal.png'))
    for _ in range(8):
        page.keyboard.press('Tab')
        record('keyboard focus stays in modal', page.evaluate('document.querySelector("dialog").contains(document.activeElement)'))
    close_dialog(page)
    record('escape restores focus to project preview', first.locator('.project-preview').evaluate('e=>e===document.activeElement'))
    page.wait_for_timeout(550)
    drag(page, first.locator('.project-preview'), -30)
    page.wait_for_timeout(650)
    record('cancelled drag resets without navigating', not page.locator('dialog').evaluate('e=>e.open'))
    record('cancelled drag returns image position', first.locator('.project-drag').evaluate('e=>Math.abs(gsap.getProperty(e,"x"))<1'))
    drag(page, first.locator('.project-preview'), 130)
    wait_dialog(page)
    record('rightward drag enters the portal', page.locator('#reveal-title').inner_text() == 'فروشگاه نورا')
    close_dialog(page)

    page.locator('.page-next').click()
    record('second gallery page has six projects', page.locator('.project-card:visible').count() == 6)
    page.locator('.page-next').click()
    record('third gallery page has the four remaining projects', page.locator('.project-card:visible').count() == 4)
    for group, count in [('shop',3),('food',4),('guide',1),('menu',6)]:
        page.locator(f'[data-filter="{group}"]').click()
        record(f'{group} filter applies', page.locator('.project-card:visible').count() == count)
    page.locator('.page-next').click()
    record('remaining digital menus stay reachable', page.locator('.project-card:visible').count() == 2)
    # A card that started on a hidden page must still be draggable after a filter change.
    last_visible = page.locator('.project-card:visible').first
    last_visible.scroll_into_view_if_needed()
    last_visible.hover()
    page.wait_for_timeout(550)
    drag(page, last_visible.locator('.project-preview'), 130)
    wait_dialog(page)
    record('drag works on a newly revealed gallery page', True)
    close_dialog(page)

    # Check every catalogue asset and direct-share URL without replaying motion.
    catalogue = page.locator('#project-data').evaluate('e=>JSON.parse(e.textContent)')
    for project in catalogue:
        for mode in ['desktop_url','mobile_url']:
            response = context.request.get(BASE.rstrip('/') + project[mode])
            record(f'{project["slug"]} {mode} exists', response.status == 200)
    shared = context.new_page()
    shared.goto(BASE + '#project-pizza', wait_until='networkidle')
    record('direct project URL opens matching introduction', shared.locator('dialog').evaluate('e=>e.open') and 'پیتزا' in shared.locator('#reveal-title').inner_text())
    shared.close()

    # Responsive layouts must not add horizontal page scrolling.
    for width in [320,390,768,1440]:
        page.set_viewport_size({'width':width,'height':900 if width>600 else 844})
        page.goto(BASE, wait_until='networkidle')
        record(f'no horizontal overflow at {width}px', page.evaluate('document.documentElement.scrollWidth<=innerWidth'))

    mobile_context = browser.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True, device_scale_factor=1)
    mobile = mobile_context.new_page()
    mobile.on('pageerror', lambda error: ERRORS.append(str(error)))
    mobile.goto(BASE, wait_until='networkidle')
    mobile.wait_for_timeout(800)
    mobile.screenshot(path=str(OUT/'final-mobile.png'), full_page=True)
    first_mobile = mobile.locator('.project-preview').first
    first_mobile.tap()
    wait_dialog(mobile)
    record('touch tap opens project introduction', mobile.locator('dialog').evaluate('e=>e.open'))
    mobile.screenshot(path=str(OUT/'final-mobile-reveal.png'))
    mobile.locator('.reveal-close').tap()
    mobile.wait_for_timeout(400)
    first_mobile.scroll_into_view_if_needed()
    box = first_mobile.bounding_box()
    x, y = box['x'] + box['width']*.4, box['y'] + box['height']*.55
    cdp = mobile_context.new_cdp_session(mobile)
    cdp.send('Input.dispatchTouchEvent', {'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
    for i in range(1,13):
        cdp.send('Input.dispatchTouchEvent', {'type':'touchMove','touchPoints':[{'x':x+i*9,'y':y}]})
        mobile.wait_for_timeout(18)
    mobile.screenshot(path=str(OUT/'final-touch-drag.png'))
    cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})
    wait_dialog(mobile)
    record('horizontal touch drag enters portal', True)
    mobile.locator('.reveal-close').tap()
    mobile.wait_for_timeout(350)
    first_mobile.scroll_into_view_if_needed()
    box = first_mobile.bounding_box()
    x, y = box['x']+box['width']*.4, box['y']+box['height']*.75
    start_scroll = mobile.evaluate('scrollY')
    cdp.send('Input.dispatchTouchEvent', {'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
    for i in range(1,10):
        cdp.send('Input.dispatchTouchEvent', {'type':'touchMove','touchPoints':[{'x':x,'y':y-i*16}]})
        mobile.wait_for_timeout(22)
    cdp.send('Input.dispatchTouchEvent', {'type':'touchEnd','touchPoints':[]})
    mobile.wait_for_timeout(350)
    record('vertical touch gesture scrolls instead of trapping the page', mobile.evaluate('scrollY') > start_scroll + 30 and not mobile.locator('dialog').evaluate('e=>e.open'))

    reduced_context = browser.new_context(viewport={'width':1366,'height':768}, reduced_motion='reduce')
    reduced_page = reduced_context.new_page()
    reduced_page.goto(BASE,wait_until='networkidle')
    reduced_page.locator('.project-open').first.click()
    record('reduced motion opens reveal immediately', reduced_page.locator('dialog').evaluate('e=>e.open'))
    record('reduced motion has no transition overlay', reduced_page.locator('.portal-transition').evaluate('e=>getComputedStyle(e).display') == 'none')
    reduced_page.keyboard.press('Escape')

    fallback_context = browser.new_context(java_script_enabled=False)
    fallback = fallback_context.new_page()
    fallback.goto(BASE,wait_until='networkidle')
    record('without JavaScript all sixteen live links remain visible', fallback.locator('.project-preview:visible').count() == 16)
    record('without JavaScript enhancement-only controls are hidden', fallback.locator('.project-open:visible').count() == 0 and fallback.locator('.gallery-toolbar:visible').count() == 0)
    record('no browser JavaScript errors', not ERRORS)
    (OUT/'browser-report.json').write_text(json.dumps({'passed':len(RESULTS),'checks':RESULTS,'js_errors':ERRORS},ensure_ascii=False,indent=2))
    print('COMPLETE',len(RESULTS),'checks',flush=True)
    browser.close()
