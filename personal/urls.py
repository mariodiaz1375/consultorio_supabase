from django.urls import path, include
from .views import PersonalList

urlpatterns = [
    path('', PersonalList.as_view(), name='pacientes_list')
]