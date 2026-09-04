from django.contrib import admin
from django.utils import timezone

from .models import Household, Member


class MemberInline(admin.TabularInline):
    model = Member
    extra = 0
    can_delete = False
    fields = ("name", "is_admin", "is_active", "joined_at", "removed_at")
    readonly_fields = ("joined_at", "removed_at")


@admin.register(Household)
class HouseholdAdmin(admin.ModelAdmin):
    list_display = ("name", "access_code", "created_at")
    search_fields = ("name", "access_code")
    readonly_fields = ("access_code", "created_at")
    inlines = (MemberInline,)


@admin.action(description="Deactivate selected members")
def deactivate_members(modeladmin, request, queryset):
    members = queryset.filter(is_active=True)
    count = 0
    for member in members:
        member.is_active = False
        member.removed_at = timezone.now()
        member.save(update_fields=("is_active", "removed_at"))
        count += 1
    modeladmin.message_user(request, f"Deactivated {count} member(s).")


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ("name", "household", "is_admin", "is_active", "joined_at")
    list_filter = ("is_admin", "is_active", "household")
    search_fields = ("name", "household__name")
    fields = (
        "household",
        "name",
        "is_admin",
        "is_active",
        "joined_at",
        "removed_at",
    )
    readonly_fields = ("joined_at", "removed_at")
    actions = (deactivate_members,)

    def save_model(self, request, obj, form, change):
        if not obj.is_active and obj.removed_at is None:
            obj.removed_at = timezone.now()
        super().save_model(request, obj, form, change)

    def has_delete_permission(self, request, obj=None):
        # Member rows are retained so historical chore records remain readable.
        return False
