from django.shortcuts import render

from menu.tulliana_data import TULLIANA_CATEGORIES, TULLIANA_MENU_DATA

MENU_DATA = [
    {"name": "سبز", "description": "اسفناج، سیب، کیوی و لیمو", "price": "۱۸۵", "category": "آبمیوه طبیعی", "image": "menu/assets/products/green-apple.png", "badge": "بدون شکر"},
    {"name": "پرتقال تازه", "description": "پرتقال تازه و یخ", "price": "۱۵۵", "category": "آبمیوه طبیعی", "image": "menu/assets/products/cantaloupe.png", "badge": "تازه"},
    {"name": "سیب و کرفس", "description": "سیب سبز، کرفس و لیمو", "price": "۱۷۵", "category": "آبمیوه طبیعی", "image": "menu/assets/products/kiwi.png"},
    {"name": "هویج و سیب", "description": "هویج تازه، سیب و زنجبیل", "price": "۱۶۵", "category": "آبمیوه طبیعی", "image": "menu/assets/products/grapefruit.png"},
    {"name": "تروپیکال", "description": "انبه، آناناس، موز و نارگیل", "price": "۱۹۵", "category": "اسموتی", "image": "menu/assets/products/mango.png", "badge": "محبوب"},
    {"name": "مانگو تانگو", "description": "انبه، موز و پرتقال", "price": "۱۹۵", "category": "اسموتی", "image": "menu/assets/products/cantaloupe-smoothie.png"},
    {"name": "بری میکس", "description": "توت‌فرنگی، بلوبری و تمشک", "price": "۲۱۵", "category": "اسموتی", "image": "menu/assets/products/blackberry-smoothie.png"},
    {"name": "پینک بری", "description": "توت‌فرنگی، موز و ماست", "price": "۲۰۵", "category": "اسموتی", "image": "menu/assets/products/pomegranate-smoothie.png", "badge": "جدید"},
    {"name": "شکلات", "description": "بستنی، شکلات، شیر و سس شکلات", "price": "۱۸۵", "category": "شیک", "image": "menu/assets/products/chocolate-shake.png", "badge": "پرفروش"},
    {"name": "لوتوس", "description": "بیسکویت و کرم لوتوس", "price": "۲۲۵", "category": "شیک", "image": "menu/assets/products/coffee-shake.png"},
    {"name": "اورئو", "description": "بیسکویت اورئو و بستنی وانیلی", "price": "۲۰۵", "category": "شیک", "image": "menu/assets/products/chocolate-shake.png"},
    {"name": "موکا", "description": "اسپرسو، بستنی و شکلات", "price": "۲۱۵", "category": "شیک", "image": "menu/assets/products/coffee-shake.png"},
    {"name": "آووکادو", "description": "آووکادو، شیر و عسل", "price": "۲۲۵", "category": "معجون", "image": "menu/assets/products/lemon-mint.png", "badge": "ویتامینی"},
    {"name": "معجون مخصوص", "description": "موز، خرما، گردو، عسل و بستنی", "price": "۲۵۵", "category": "معجون", "image": "menu/assets/products/green-apple.png", "badge": "کامل"},
    {"name": "شیرموز خرما", "description": "موز، شیر، خرما و دارچین", "price": "۱۸۵", "category": "معجون", "image": "menu/assets/products/cantaloupe-smoothie.png"},
    {"name": "انرژی پلاس", "description": "موز، کره بادام‌زمینی و پروتئین", "price": "۲۴۵", "category": "معجون", "image": "menu/assets/products/coffee-shake.png"},
    {"name": "توت‌فرنگی", "description": "توت‌فرنگی تازه و بستنی", "price": "۱۹۵", "category": "بستنی", "image": "menu/assets/products/pomegranate-smoothie.png", "badge": "میوه‌ای"},
    {"name": "زعفرانی", "description": "بستنی سنتی، زعفران و پسته", "price": "۱۸۵", "category": "بستنی", "image": "menu/assets/products/mango.png"},
    {"name": "شکلاتی", "description": "بستنی شکلاتی و تکه‌های شکلات", "price": "۱۹۵", "category": "بستنی", "image": "menu/assets/products/chocolate-shake.png"},
    {"name": "میکس مخصوص", "description": "سه اسکوپ از طعم‌های انتخابی", "price": "۲۱۵", "category": "بستنی", "image": "menu/assets/products/blackberry-smoothie.png"},
    {"name": "اسپرسو", "description": "دبل شات قهوه تازه", "price": "۹۵", "category": "گرم و نوشیدنی", "image": "menu/assets/products/coffee-shake.png", "badge": "کلاسیک"},
    {"name": "کاپوچینو", "description": "اسپرسو، شیر و فوم نرم", "price": "۱۴۵", "category": "گرم و نوشیدنی", "image": "menu/assets/products/coffee-shake.png"},
    {"name": "هات چاکلت", "description": "شکلات داغ و شیر", "price": "۱۵۵", "category": "گرم و نوشیدنی", "image": "menu/assets/products/chocolate-shake.png"},
    {"name": "ماسالا", "description": "چای ادویه‌ای، شیر و دارچین", "price": "۱۳۵", "category": "گرم و نوشیدنی", "image": "menu/assets/products/cantaloupe-smoothie.png"},
]

CATEGORY_ORDER = [
    "آبمیوه طبیعی",
    "اسموتی",
    "شیک",
    "معجون",
    "بستنی",
    "گرم و نوشیدنی",
]

SHOP_NAME = "آبمیوه‌فروشی"


def home(request):
    return render(request, "pages/home.html", {
        "shop_name": "فروشگاه‌های ویتا و تولیانا",
        "page_description": "ورود به فروشگاه‌های آنلاین، منوی تولیانا و محصولات ویژه ویتا.",
    })


def menu(request):
    return _render_menu(
        request,
        MENU_DATA,
        CATEGORY_ORDER,
        {
            "shop_name": SHOP_NAME,
            "page_description": "منوی آبمیوه‌ها و نوشیدنی‌های تازه ویتا",
            "brand_label": "VITA",
            "menu_theme": "juice-menu",
            "other_menu_url": "tulliana_menu",
            "other_menu_label": "منوی فست‌فود تولیانا",
            "hero_line_one": "میوه‌های تازه",
            "hero_line_two": "حال خوب واقعی",
            "hero_benefits": [("✦", "خوشمزه"), ("◆", "سالم"), ("❧", "طبیعی")],
            "search_placeholder": "اسم یا ترکیبات رو جستجو کن...",
            "footer_kicker": "طعم خوبِ لحظه‌ها",
            "footer_line_one": "منتظرتیم،",
            "footer_line_two": "با یه",
            "footer_emphasis": "لیوان خنک.",
            "footer_note": "اطلاعات تماس و آدرس فروشگاه اینجا قرار می‌گیرد.",
        },
    )


def tulliana_menu(request):
    return _render_menu(
        request,
        TULLIANA_MENU_DATA,
        TULLIANA_CATEGORIES,
        {
            "shop_name": "فست‌فود تولیانا",
            "page_description": "منوی فست‌فود تولیانا؛ پیتزا، پاستا، ساندویچ، نوشیدنی و دسر",
            "brand_label": "vite",
            "menu_theme": "tulliana-menu",
            "other_menu_url": "menu",
            "other_menu_label": "منوی آبمیوه ویتا",
            "hero_line_one": "یک انتخاب خوشمزه",
            "hero_line_two": "برای هر سلیقه",
            "hero_benefits": [("♨", "تازه و داغ"), ("✦", "مواد مرغوب"), ("♥", "تنوع بالا")],
            "search_placeholder": "پیتزا، پاستا یا غذای دلخواهت رو پیدا کن...",
            "footer_kicker": "خوشمزه‌تر کنار هم",
            "footer_line_one": "منتظرتیم،",
            "footer_line_two": "با یه",
            "footer_emphasis": "وعده خوشمزه.",
            "footer_note": "اطلاعات تماس و آدرس فست‌فود اینجا قرار می‌گیرد.",
        },
    )


def _render_menu(request, menu_items, categories, page_context):
    menu_groups = [
        {
            "name": category,
            "items": [item for item in menu_items if item["category"] == category],
        }
        for category in categories
    ]
    context = {
        **page_context,
        "categories": categories,
        "menu_groups": menu_groups,
        "menu_items": menu_items,
    }
    return render(
        request,
        "menu/index.html",
        context,
    )
