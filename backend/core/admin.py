from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Only register User model to hide other details
admin.site.register(User, UserAdmin)
