from django.urls import path, include
from .views import PersonalList, PersonalDetail, PuestosList, EspecialidadesList, PersonalMeView, PasswordResetRequestView, PasswordResetConfirmView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# urlpatterns = [
#     path('', PersonalList.as_view(), name='personal_list'),
#     path('<int:pk>/', PersonalDetail.as_view(), name='personal_detail'),
#     path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
# ]

urlpatterns = [
    path('', PersonalList.as_view(), name='personal_list'),
    path('me/', PersonalMeView.as_view(), name='personal_me'), # El endpoint será: /api/personal/me/
    path('<int:pk>/', PersonalDetail.as_view(), name='personal_detail'),

    path('puestos/', PuestosList.as_view(), name='puestos_list'),
    path('especialidades/', EspecialidadesList.as_view(), name='especialidades_list'),
    
    # Rutas de autenticación
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]