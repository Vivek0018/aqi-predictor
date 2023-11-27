from django.urls import path
from . import views

urlpatterns = [
    path('', views.getAQI),
    path('data/', views.demo)
]