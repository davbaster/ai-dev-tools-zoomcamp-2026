from django.contrib import admin
from django.core.exceptions import ValidationError
from django.test import TestCase

from .models import Household, Member


class HouseholdModelTests(TestCase):
    def test_household_gets_a_persistent_access_code(self):
        household = Household.objects.create(name="The Green House")
        original_code = household.access_code

        self.assertEqual(len(original_code), 12)
        self.assertTrue(
            set(original_code) <= set("0123456789ABCDEF"),
        )

        household.name = "The Blue House"
        household.save()
        household.refresh_from_db()

        self.assertEqual(household.access_code, original_code)

    def test_access_codes_are_unique(self):
        first = Household.objects.create(name="First House")
        second = Household.objects.create(name="Second House")

        self.assertNotEqual(first.access_code, second.access_code)


class MemberModelTests(TestCase):
    def setUp(self):
        self.household = Household.objects.create(name="The Green House")

    def test_member_names_are_unique_within_a_household(self):
        Member.objects.create(household=self.household, name="Alex")
        duplicate = Member(household=self.household, name="Alex")

        with self.assertRaises(ValidationError):
            duplicate.full_clean()

    def test_same_member_name_is_allowed_in_another_household(self):
        another_household = Household.objects.create(name="Another House")

        Member.objects.create(household=self.household, name="Alex")
        other_member = Member.objects.create(
            household=another_household,
            name="Alex",
        )

        self.assertEqual(other_member.name, "Alex")

    def test_members_can_have_multiple_admins(self):
        first_admin = Member.objects.create(
            household=self.household,
            name="Alex",
            is_admin=True,
        )
        second_admin = Member.objects.create(
            household=self.household,
            name="Sam",
            is_admin=True,
        )

        self.assertEqual(
            self.household.members.filter(is_admin=True).count(),
            2,
        )
        self.assertTrue(first_admin.is_admin)
        self.assertTrue(second_admin.is_admin)

    def test_deactivating_a_member_preserves_their_record(self):
        member = Member.objects.create(
            household=self.household,
            name="Alex",
        )

        member.deactivate()
        member.refresh_from_db()

        self.assertFalse(member.is_active)
        self.assertIsNotNone(member.removed_at)
        self.assertTrue(Member.objects.filter(pk=member.pk).exists())


class AdminRegistrationTests(TestCase):
    def test_household_and_member_are_registered(self):
        self.assertIn(Household, admin.site._registry)
        self.assertIn(Member, admin.site._registry)
