#!/usr/bin/env python
"""Test script to verify backend token endpoint and device sessions API."""

import os
import sys
import django
import json
from django.contrib.auth import get_user_model

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legal_connect.settings')
django.setup()

from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

def test_login_and_sessions():
    """Test the login and device sessions endpoints."""
    client = APIClient()
    
    # Create a test user if it doesn't exist
    test_user, created = User.objects.get_or_create(
        email='testuser@test.com',
        defaults={'username': 'testuser', 'is_active': True}
    )
    if created:
        test_user.set_password('testpassword123')
        test_user.save()
        print(f"Created test user: {test_user.email}")
    else:
        # Update password for existing user
        test_user.set_password('testpassword123')
        test_user.save()
        print(f"Using existing test user: {test_user.email}")
    
    print("\n" + "="*80)
    print("1. Testing Login Endpoint")
    print("="*80)
    
    login_data = {
        "email": "testuser@test.com",
        "password": "testpassword123"
    }
    
    response = client.post('/api/v1/auth/token/', login_data, format='json')
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code != status.HTTP_200_OK:
        print("ERROR: Login failed!")
        return
    
    token_data = response.json()
    access_token = token_data.get('access')
    
    if not access_token:
        print("ERROR: No access token in response!")
        return
    
    print(f"Access token received: {access_token[:50]}...")
    
    print("\n" + "="*80)
    print("2. Testing Device Sessions Endpoint (with auth)")
    print("="*80)
    
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    
    response = client.get('/api/v1/users/sessions/', format='json')
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == status.HTTP_200_OK:
        print("SUCCESS: Device sessions endpoint is working!")
    else:
        print(f"ERROR: Device sessions returned {response.status_code}")

if __name__ == '__main__':
    test_login_and_sessions()
