import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legal_connect.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# Delete old user if exists
User.objects.filter(email='test@test.com').delete()

# Create new test user
user = User.objects.create_user(
    email='test@test.com',
    password='password123'
)
user.is_active = True
user.save()

print(f"Created user: {user.email}")
print(f"User ID: {user.id}")
print(f"is_active: {user.is_active}")
print("Password: password123")
