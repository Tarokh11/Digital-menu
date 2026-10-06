from django.urls import path

from menu.views import home, menu, tulliana_menu

urlpatterns = [
    path("", home, name="home"),
    path("menu/", menu, name="menu"),
    path("tulliana/", tulliana_menu, name="tulliana_menu"),
]
