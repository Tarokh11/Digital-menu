from django.shortcuts import render


MENU_DATA = [
    {"name": "آب‌پرتقال طبیعی", "description": "آب‌گیری تازه از پرتقال‌های روز", "price": "۱۲۰٬۰۰۰ تومان", "category": "آبمیوه‌های طبیعی"},
    {"name": "اسموتی انبه و کیوی", "description": "ترکیب میوه‌های تازه با یخ", "price": "۱۸۰٬۰۰۰ تومان", "category": "آبمیوه‌های طبیعی"},
    {"name": "لیموناد تازه", "description": "لیمو، نعناع و کمی شیرینی", "price": "۹۵٬۰۰۰ تومان", "category": "نوشیدنی‌های خنک"},
    {"name": "کاسه میوه فصل", "description": "میوه‌های تازه و خردشده فصل", "price": "۱۵۰٬۰۰۰ تومان", "category": "میان‌وعده"},
]


SHOP_NAME = "آبمیوه‌فروشی"


def home(request):
    return render(request, "pages/home.html", {"shop_name": SHOP_NAME})


def menu(request):
    categories = {}
    for item in MENU_DATA:
        categories.setdefault(item["category"], []).append(item)
    return render(request, "menu/index.html", {"categories": categories, "shop_name": SHOP_NAME})
