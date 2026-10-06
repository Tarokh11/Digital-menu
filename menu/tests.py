from django.test import TestCase, override_settings
from django.urls import reverse


@override_settings(
    STORAGES={
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        }
    }
)
class MenuPageTests(TestCase):
    def test_homepage_is_persian_rtl_and_links_to_menu(self):
        response = self.client.get(reverse("home"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'lang="fa" dir="rtl"')
        self.assertContains(response, "طعم")
        self.assertContains(response, "مشاهده منو")
        self.assertContains(response, reverse("menu"))

    def test_menu_page_renders_categories_and_items(self):
        response = self.client.get(reverse("menu"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "میوه‌های تازه")
        self.assertContains(response, "حال خوب واقعی")
        self.assertContains(response, "تروپیکال")
        self.assertContains(response, "شکلات")
        self.assertNotContains(response, "شکلات کلاسیک")
        self.assertContains(response, "اسموتی")
        self.assertContains(response, 'id="menu-search-input"')
        self.assertContains(response, "menu/menu.js")

    def test_menu_renders_all_product_cards(self):
        response = self.client.get(reverse("menu"))
        self.assertEqual(len(response.context["menu_items"]), 24)
        self.assertEqual(len(response.context["menu_groups"]), 6)
        self.assertContains(response, "data-category-section", count=6)
        self.assertContains(response, "data-product-option", count=24)
