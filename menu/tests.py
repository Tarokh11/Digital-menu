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
        self.assertContains(response, "آب‌پرتقال طبیعی")
        self.assertContains(response, "آبمیوه‌های طبیعی")
