from django.urls import path
from django.views.generic import RedirectView

from menu.views import home, menu, menu_new, tulliana_menu
from menu.views_v2 import menu_v2

urlpatterns = [
    path("", home, name="home"),
    path("menu/", menu, name="menu"),
    path("menu-v2/", menu_v2, name="menu_v2"),
    path("menu-v1/", menu_new, name="menu_new"),
    path("pizza-01/", tulliana_menu, name="tulliana_menu"),
    path("menu-new/", RedirectView.as_view(pattern_name="menu_new", permanent=True), name="menu_new_legacy"),
    path("tulliana/", RedirectView.as_view(pattern_name="tulliana_menu", permanent=True), name="tulliana_menu_legacy"),
]
