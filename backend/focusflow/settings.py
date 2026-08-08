"""
Django settings for focusflow project.
"""

from pathlib import Path
from datetime import timedelta
import os

import dj_database_url
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


# =========================================================
# SECURITY
# =========================================================

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-development-only-key"
)

DEBUG = os.environ.get("DEBUG", "False").lower() == "true"

ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get(
        "ALLOWED_HOSTS",
        "localhost,127.0.0.1"
    ).split(",")
    if host.strip()
]


# =========================================================
# APPLICATIONS
# =========================================================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "drf_yasg",

    "core",
]


# =========================================================
# MIDDLEWARE
# =========================================================

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# =========================================================
# URL / WSGI
# =========================================================

ROOT_URLCONF = "focusflow.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "focusflow.wsgi.application"


# =========================================================
# DATABASE
# =========================================================

DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Local development
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get(
                "DB_NAME",
                "productivity_app"
            ),
            "USER": os.environ.get(
                "DB_USER",
                "postgres"
            ),
            "PASSWORD": os.environ.get(
                "DB_PASSWORD",
                ""
            ),
            "HOST": os.environ.get(
                "DB_HOST",
                "localhost"
            ),
            "PORT": os.environ.get(
                "DB_PORT",
                "5432"
            ),
        }
    }


# =========================================================
# CUSTOM USER
# =========================================================

AUTH_USER_MODEL = "core.User"


# =========================================================
# PASSWORD VALIDATION
# =========================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


# =========================================================
# INTERNATIONALIZATION
# =========================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# =========================================================
# STATIC FILES
# =========================================================

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"


# =========================================================
# DEFAULT PRIMARY KEY
# =========================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# =========================================================
# CORS
# =========================================================

CORS_ALLOWED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173",
        "*"
    ).split(",")
    if origin.strip()
]

CSRF_TRUSTED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.environ.get(
        "CSRF_TRUSTED_ORIGINS",
        "http://localhost:5173"
    ).split(",")
    if origin.strip()
]


# =========================================================
# DJANGO REST FRAMEWORK
# =========================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}


# =========================================================
# SIMPLE JWT
# =========================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "ALGORITHM": "HS256",
}


# =========================================================
# SWAGGER
# =========================================================

SWAGGER_SETTINGS = {
    "SECURITY_DEFINITIONS": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
        }
    },
    "DEFAULT_MODEL_DEPTH": -1,
}