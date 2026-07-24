from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """
    def has_object_permission(self, request, view, obj):
        # obj.user_id refers to the FK in your Task/Expense tables
        return obj.user_id == request.user.id
    
    permission_classes = [permissions.IsAuthenticated, IsOwner]