from unittest.mock import patch

from django.test import SimpleTestCase, override_settings
from django.urls import reverse

from menu import views, views_v2


@override_settings(STORAGES={
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
})
class IndependentMenuTests(SimpleTestCase):
    def test_menu_uses_independent_templates_and_assets(self):
        original = self.client.get(reverse("menu"))
        copy = self.client.get(reverse("menu_v2"))
        self.assertEqual(original.status_code, 200)
        self.assertEqual(copy.status_code, 200)
        for independent, shared in [
            ("menu/menu-v2.css", "menu/menu.css"),
            ("menu/themes-v2.css", "menu/themes.css"),
            ("menu/menu-v2.js", "menu/menu.js"),
        ]:
            self.assertContains(copy, independent)
            self.assertNotContains(copy, shared)
        self.assertEqual(len(copy.context["menu_items"]), 24)
        self.assertEqual(len(copy.context["menu_groups"]), 6)
        self.assertTrue(all(item["image"].startswith("menu/assets/cutouts-v2/") for item in copy.context["menu_items"]))
        self.assertTemplateUsed(copy, "layouts/base_v2.html")
        self.assertTemplateUsed(copy, "menu/v2.html")

    def test_changes_to_copy_data_do_not_affect_original(self):
        self.assertIsNot(views_v2.MENU_DATA, views.MENU_DATA)
        self.assertIsNot(views_v2.CATEGORY_ORDER, views.CATEGORY_ORDER)
        for copy_item, original_item in zip(views_v2.MENU_DATA, views.MENU_DATA):
            self.assertIsNot(copy_item, original_item)
        with patch.dict(views_v2.MENU_DATA[0], name="محصول مستقل نسخه دوم"):
            self.assertContains(self.client.get(reverse("menu_v2")), "محصول مستقل نسخه دوم")
            self.assertNotContains(self.client.get(reverse("menu")), "محصول مستقل نسخه دوم")
