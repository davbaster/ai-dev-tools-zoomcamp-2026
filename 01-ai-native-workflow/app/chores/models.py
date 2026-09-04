from secrets import token_hex

from django.db import models
from django.utils import timezone


def generate_access_code():
    """Return a short, readable-enough code that remains stable after saving."""

    return token_hex(6).upper()


class Household(models.Model):
    name = models.CharField(max_length=100)
    access_code = models.CharField(
        max_length=12,
        unique=True,
        default=generate_access_code,
        editable=False,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name", "id"]

    def __str__(self):
        return self.name


class Member(models.Model):
    household = models.ForeignKey(
        Household,
        on_delete=models.CASCADE,
        related_name="members",
    )
    name = models.CharField(max_length=80)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    removed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["household", "name", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["household", "name"],
                name="unique_member_name_per_household",
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.household})"

    def save(self, *args, **kwargs):
        if not self.is_active and self.removed_at is None:
            self.removed_at = timezone.now()
        super().save(*args, **kwargs)

    def deactivate(self):
        """Remove a member without deleting their historical record."""

        if self.is_active:
            self.is_active = False
            self.removed_at = timezone.now()
            self.save(update_fields=["is_active", "removed_at"])
