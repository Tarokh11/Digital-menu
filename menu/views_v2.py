"""Independent menu copy; edit this module for /menu-v2/ only."""

from django.shortcuts import render


MENU_DATA = [
    {'name': 'سبز', 'description': 'اسفناج، سیب، کیوی و لیمو', 'price': '۱۸۵', 'category': 'آبمیوه طبیعی', 'image': 'menu/assets/cutouts-v2/green-apple.png', 'badge': 'بدون شکر'},
    {'name': 'پرتقال تازه', 'description': 'پرتقال تازه و یخ', 'price': '۱۵۵', 'category': 'آبمیوه طبیعی', 'image': 'menu/assets/cutouts-v2/orange.png', 'badge': 'تازه'},
    {'name': 'سیب و کرفس', 'description': 'سیب سبز، کرفس و لیمو', 'price': '۱۷۵', 'category': 'آبمیوه طبیعی', 'image': 'menu/assets/cutouts-v2/green-apple.png'},
    {'name': 'هویج و سیب', 'description': 'هویج تازه، سیب و زنجبیل', 'price': '۱۶۵', 'category': 'آبمیوه طبیعی', 'image': 'menu/assets/cutouts-v2/orange.png'},
    {'name': 'تروپیکال', 'description': 'انبه، آناناس، موز و نارگیل', 'price': '۱۹۵', 'category': 'اسموتی', 'image': 'menu/assets/cutouts-v2/pineapple.png', 'badge': 'محبوب'},
    {'name': 'مانگو تانگو', 'description': 'انبه، موز و پرتقال', 'price': '۱۹۵', 'category': 'اسموتی', 'image': 'menu/assets/cutouts-v2/mango.png'},
    {'name': 'بری میکس', 'description': 'توت\u200cفرنگی، بلوبری و تمشک', 'price': '۲۱۵', 'category': 'اسموتی', 'image': 'menu/assets/cutouts-v2/mixed-berry.png'},
    {'name': 'پینک بری', 'description': 'توت\u200cفرنگی، موز و ماست', 'price': '۲۰۵', 'category': 'اسموتی', 'image': 'menu/assets/cutouts-v2/strawberry.png', 'badge': 'جدید'},
    {'name': 'شکلات', 'description': 'بستنی، شکلات، شیر و سس شکلات', 'price': '۱۸۵', 'category': 'شیک', 'image': 'menu/assets/cutouts-v2/mixed-berry.png', 'badge': 'پرفروش'},
    {'name': 'لوتوس', 'description': 'بیسکویت و کرم لوتوس', 'price': '۲۲۵', 'category': 'شیک', 'image': 'menu/assets/cutouts-v2/cantaloupe.png'},
    {'name': 'اورئو', 'description': 'بیسکویت اورئو و بستنی وانیلی', 'price': '۲۰۵', 'category': 'شیک', 'image': 'menu/assets/cutouts-v2/mixed-berry.png'},
    {'name': 'موکا', 'description': 'اسپرسو، بستنی و شکلات', 'price': '۲۱۵', 'category': 'شیک', 'image': 'menu/assets/cutouts-v2/mixed-berry.png'},
    {'name': 'آووکادو', 'description': 'آووکادو، شیر و عسل', 'price': '۲۲۵', 'category': 'معجون', 'image': 'menu/assets/cutouts-v2/avocado.png', 'badge': 'ویتامینی'},
    {'name': 'معجون مخصوص', 'description': 'موز، خرما، گردو، عسل و بستنی', 'price': '۲۵۵', 'category': 'معجون', 'image': 'menu/assets/cutouts-v2/avocado.png', 'badge': 'کامل'},
    {'name': 'شیرموز خرما', 'description': 'موز، شیر، خرما و دارچین', 'price': '۱۸۵', 'category': 'معجون', 'image': 'menu/assets/cutouts-v2/cantaloupe.png'},
    {'name': 'انرژی پلاس', 'description': 'موز، کره بادام\u200cزمینی و پروتئین', 'price': '۲۴۵', 'category': 'معجون', 'image': 'menu/assets/cutouts-v2/avocado.png'},
    {'name': 'توت\u200cفرنگی', 'description': 'توت\u200cفرنگی تازه و بستنی', 'price': '۱۹۵', 'category': 'بستنی', 'image': 'menu/assets/cutouts-v2/strawberry.png', 'badge': 'میوه\u200cای'},
    {'name': 'زعفرانی', 'description': 'بستنی سنتی، زعفران و پسته', 'price': '۱۸۵', 'category': 'بستنی', 'image': 'menu/assets/cutouts-v2/mango.png'},
    {'name': 'شکلاتی', 'description': 'بستنی شکلاتی و تکه\u200cهای شکلات', 'price': '۱۹۵', 'category': 'بستنی', 'image': 'menu/assets/cutouts-v2/mixed-berry.png'},
    {'name': 'میکس مخصوص', 'description': 'سه اسکوپ از طعم\u200cهای انتخابی', 'price': '۲۱۵', 'category': 'بستنی', 'image': 'menu/assets/cutouts-v2/mixed-berry.png'},
    {'name': 'اسپرسو', 'description': 'دبل شات قهوه تازه', 'price': '۹۵', 'category': 'گرم و نوشیدنی', 'image': 'menu/assets/cutouts-v2/cherry.png', 'badge': 'کلاسیک'},
    {'name': 'کاپوچینو', 'description': 'اسپرسو، شیر و فوم نرم', 'price': '۱۴۵', 'category': 'گرم و نوشیدنی', 'image': 'menu/assets/cutouts-v2/cantaloupe.png'},
    {'name': 'هات چاکلت', 'description': 'شکلات داغ و شیر', 'price': '۱۵۵', 'category': 'گرم و نوشیدنی', 'image': 'menu/assets/cutouts-v2/mixed-berry.png'},
    {'name': 'ماسالا', 'description': 'چای ادویه\u200cای، شیر و دارچین', 'price': '۱۳۵', 'category': 'گرم و نوشیدنی', 'image': 'menu/assets/cutouts-v2/orange.png'},
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


def menu_v2(request):
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
        "menu/v2.html",
        context,
    )
