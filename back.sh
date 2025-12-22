#!/bin/bash

# Root
mkdir -p backend
cd backend
touch pyproject.toml
touch .env
touch .env.example
touch .gitignore
touch README.md

# Alembic
mkdir -p alembic/versions
touch alembic/env.py
touch alembic/script.py.mako

# App base
mkdir -p app
touch app/__init__.py
touch app/main.py
touch app/config.py

######################################
# Shared Layer
######################################
mkdir -p app/shared
touch app/shared/__init__.py

# Database
mkdir -p app/shared/database
touch app/shared/database/__init__.py
touch app/shared/database/base.py
touch app/shared/database/session.py
touch app/shared/database/repository.py

# Security
mkdir -p app/shared/security
touch app/shared/security/__init__.py
touch app/shared/security/jwt.py
touch app/shared/security/password.py
touch app/shared/security/permissions.py
touch app/shared/security/dependencies.py

# Exceptions
mkdir -p app/shared/exceptions
touch app/shared/exceptions/__init__.py
touch app/shared/exceptions/base.py
touch app/shared/exceptions/http.py
touch app/shared/exceptions/business.py

# Schemas shared
mkdir -p app/shared/schemas
touch app/shared/schemas/__init__.py
touch app/shared/schemas/base.py
touch app/shared/schemas/responses.py
touch app/shared/schemas/pagination.py

# Utils
mkdir -p app/shared/utils
touch app/shared/utils/__init__.py
touch app/shared/utils/validators.py
touch app/shared/utils/formatters.py
touch app/shared/utils/file_handler.py
touch app/shared/utils/audio_compressor.py
touch app/shared/utils/pdf_generator.py

# Enums
mkdir -p app/shared/enums
touch app/shared/enums/__init__.py
touch app/shared/enums/roles.py
touch app/shared/enums/subscription_types.py
touch app/shared/enums/correction_status.py

######################################
# MODULES
######################################
mkdir -p app/modules

create_module () {
  MODULE=$1
  mkdir -p app/modules/$MODULE
  touch app/modules/$MODULE/__init__.py
  touch app/modules/$MODULE/models.py
  touch app/modules/$MODULE/schemas.py
  touch app/modules/$MODULE/repository.py
  touch app/modules/$MODULE/service.py
  touch app/modules/$MODULE/controller.py
}

# Auth (special case)
mkdir -p app/modules/auth
touch app/modules/auth/__init__.py
touch app/modules/auth/models.py
touch app/modules/auth/schemas.py
touch app/modules/auth/service.py
touch app/modules/auth/controller.py
touch app/modules/auth/dependencies.py

# Core modules
create_module "users"
create_module "organizations"
create_module "plans"
create_module "subscriptions"
create_module "payments"

# Content modules
create_module "series"
create_module "questions"
create_module "expression_tasks"

# Exam modules
create_module "exam_attempts"
create_module "comprehension_answers"
create_module "written_expressions"
create_module "oral_expressions"

# Correction modules
mkdir -p app/modules/corrections
touch app/modules/corrections/__init__.py
touch app/modules/corrections/schemas.py
touch app/modules/corrections/service.py
touch app/modules/corrections/controller.py
touch app/modules/corrections/ai_corrector.py # Claude API integration

# Analytics & Stats
mkdir -p app/modules/analytics
touch app/modules/analytics/__init__.py
touch app/modules/analytics/schemas.py
touch app/modules/analytics/service.py
touch app/modules/analytics/controller.py

# Notifications
create_module "notifications"

# Invoices
mkdir -p app/modules/invoices
touch app/modules/invoices/__init__.py
touch app/modules/invoices/schemas.py
touch app/modules/invoices/service.py
touch app/modules/invoices/controller.py
touch app/modules/invoices/templates.py # PDF templates

# Admin
mkdir -p app/modules/admin
touch app/modules/admin/__init__.py
touch app/modules/admin/schemas.py
touch app/modules/admin/service.py
touch app/modules/admin/controller.py

######################################
# Background Tasks (Celery)
######################################
mkdir -p app/tasks
touch app/tasks/__init__.py
touch app/tasks/celery_app.py
touch app/tasks/audio_cleanup.py
touch app/tasks/stats_aggregation.py
touch app/tasks/subscription_expiry.py
touch app/tasks/invoice_generation.py

######################################
# Storage
######################################
mkdir -p app/storage
touch app/storage/__init__.py
touch app/storage/file_manager.py
touch app/storage/audio_handler.py

######################################
# External Services
######################################
mkdir -p app/external
touch app/external/__init__.py
touch app/external/anthropic_client.py # Claude API
touch app/external/payment_gateway.py # MTN/Orange/Stripe

######################################
# Scripts
######################################
mkdir -p scripts
touch scripts/seed_db.py
touch scripts/create_admin.py
touch scripts/import_series.py
touch scripts/cleanup_expired_data.py

######################################
# Tests
######################################
mkdir -p tests
touch tests/conftest.py
touch tests/__init__.py

mkdir -p tests/test_auth
touch tests/test_auth/__init__.py
touch tests/test_auth/test_login.py
touch tests/test_auth/test_register.py

mkdir -p tests/test_subscriptions
touch tests/test_subscriptions/__init__.py
touch tests/test_subscriptions/test_b2c.py
touch tests/test_subscriptions/test_b2b.py

mkdir -p tests/test_exams
touch tests/test_exams/__init__.py
touch tests/test_exams/test_comprehension.py
touch tests/test_exams/test_expression.py

mkdir -p tests/test_corrections
touch tests/test_corrections/__init__.py
touch tests/test_corrections/test_ai_correction.py
touch tests/test_corrections/test_manual_correction.py

######################################
# Media Storage Directories
######################################
mkdir -p storage/audios
mkdir -p storage/images
mkdir -p storage/invoices
mkdir -p storage/temp

######################################
# Docs
######################################
mkdir -p docs
touch docs/API.md
touch docs/DEPLOYMENT.md
touch docs/DATABASE.md

echo "✅ Architecture TCF Canada générée avec succès !"