from django.urls import path

from menu.views import home, menu, menu_new, tulliana_menu
from menu.views_v2 import menu_v2

urlpatterns = [
    path("", home, name="home"),
    path("menu/", menu, name="menu"),
    path("menu-v2/", menu_v2, name="menu_v2"),
    path("menu-new/", menu_new, name="menu_new"),
    path("tulliana/", tulliana_menu, name="tulliana_menu"),
]
