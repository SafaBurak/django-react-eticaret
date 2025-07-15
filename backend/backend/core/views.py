from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login
from django.contrib.auth import get_user_model
from .models import Item, Voucher
from .serializers import ItemSerializer, VoucherSerializer, UserSerializer
from django.db.models.manager import BaseManager
from core.models import CustomUser
from typing import cast

CustomUser = get_user_model()

# Cast the manager to the right type
UserManager = cast(BaseManager, CustomUser.objects)

class ItemList(APIView):
    def get(self, request):
        items = Item.objects.all()
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)

class VoucherList(APIView):
    def get(self, request):
        vouchers = Voucher.objects.all()
        serializer = VoucherSerializer(vouchers, many=True)
        return Response(serializer.data)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password
        )    
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)