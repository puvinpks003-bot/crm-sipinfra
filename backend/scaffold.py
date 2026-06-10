import os

apps = ['core', 'accounts', 'leads', 'projects', 'quotes', 'analytics', 'notifications']
base_dir = r"c:\Project\CRM - solar\backend\apps"

for app in apps:
    app_dir = os.path.join(base_dir, app)
    os.makedirs(app_dir, exist_ok=True)
    
    # __init__.py
    with open(os.path.join(app_dir, "__init__.py"), "w") as f:
        pass
    
    # apps.py
    with open(os.path.join(app_dir, "apps.py"), "w") as f:
        f.write(f"from django.apps import AppConfig\n\nclass {app.capitalize()}Config(AppConfig):\n    default_auto_field = 'django.db.models.BigAutoField'\n    name = 'apps.{app}'\n")
        
    # models.py
    with open(os.path.join(app_dir, "models.py"), "w") as f:
        f.write("from django.db import models\n\n# Create your models here.\n")
        
    # views.py
    with open(os.path.join(app_dir, "views.py"), "w") as f:
        f.write("from rest_framework import viewsets, permissions\n\n# Create your views here.\n")
        
    # serializers.py
    with open(os.path.join(app_dir, "serializers.py"), "w") as f:
        f.write("from rest_framework import serializers\n\n")
        
    # urls.py
    with open(os.path.join(app_dir, "urls.py"), "w") as f:
        f.write("from django.urls import path, include\nfrom rest_framework.routers import DefaultRouter\n\nrouter = DefaultRouter()\n\nurlpatterns = [\n    path('', include(router.urls)),\n]\n")

print("Scaffolding completed!")
