from django.urls import path, include
from .views import PersonalList, PersonalDetail

urlpatterns = [
    path('', PersonalList.as_view(), name='pacientes_list'),
    path('<int:pk>/', PersonalDetail.as_view(), name='personal_detail')
]