from django.urls import path

from menu.views import home, menu, menu_new, tulliana_menu

urlpatterns = [
    path("", home, name="home"),
    path("menu/", menu, name="menu"),
    path("menu-new/", menu_new, name="menu_new"),
    path("tulliana/", tulliana_menu, name="tulliana_menu"),
]
