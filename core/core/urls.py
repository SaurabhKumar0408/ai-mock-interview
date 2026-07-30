from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # auth
    path('api/auth/', include('accounts.urls')),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # interviews
    path('api/interviews/', include('interviews.urls')),

    path('api/learning/', include('learning.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)