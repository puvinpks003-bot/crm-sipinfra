from rest_framework import permissions
from apps.accounts.models import Role

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == Role.ADMIN)

class IsManagerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [Role.MANAGER, Role.ADMIN])

class IsAssignedToLeadOrManager(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in [Role.MANAGER, Role.ADMIN]:
            return True
        return obj.assigned_to == request.user

class IsCreatorOrManager(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in [Role.MANAGER, Role.ADMIN]:
            return True
        return getattr(obj, 'created_by', None) == request.user
