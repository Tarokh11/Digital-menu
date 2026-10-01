from django.shortcuts import render


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
    return render(request, "pages/home.html", {"shop_name": SHOP_NAME})


def menu(request):
    menu_groups = [
        {
            "name": category,
            "items": [item for item in MENU_DATA if item["category"] == category],
        }
        for category in CATEGORY_ORDER
    ]
    return render(
        request,
        "menu/index.html",
        {
            "categories": CATEGORY_ORDER,
            "menu_groups": menu_groups,
            "menu_items": MENU_DATA,
            "shop_name": SHOP_NAME,
        },
    )
