from django.urls import path, include
from .views import PersonalList, PersonalDetail
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('', PersonalList.as_view(), name='personal_list'),
    path('<int:pk>/', PersonalDetail.as_view(), name='personal_detail'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]