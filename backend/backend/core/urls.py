from django.urls import path
from .views import ItemList, VoucherList, LoginView, RegisterView

urlpatterns = [
    path('items/', ItemList.as_view(), name='item-list'),
    path('vouchers/', VoucherList.as_view(), name='voucher-list'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
]