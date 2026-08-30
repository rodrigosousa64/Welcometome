from django.contrib import admin
from django.urls import path,re_path
from core.api import api
from django.views.generic import TemplateView
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),

    re_path(r'^.*$', TemplateView.as_view(template_name="index.html"))
]
