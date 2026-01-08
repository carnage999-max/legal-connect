#!/usr/bin/env python
"""
Test Resend Email Configuration
Run this from the backend directory: python test_resend_email.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'legal_connect.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_resend_email():
    """Test if Resend email backend is properly configured."""
    
    print("=" * 60)
    print("Legal Connect - Resend Email Configuration Test")
    print("=" * 60)
    
    # Check configuration
    print(f"\n✓ EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
    print(f"✓ DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    print(f"✓ RESEND_API_KEY: {'***' if settings.RESEND_API_KEY else 'NOT SET'}")
    print(f"✓ SITE_URL: {settings.SITE_URL}")
    
    # Check if Resend is configured
    if 'resend' in settings.EMAIL_BACKEND.lower():
        print("\n✅ Resend backend is configured!")
        
        if not settings.RESEND_API_KEY:
            print("❌ ERROR: RESEND_API_KEY is not set in .env file")
            print("   Run: export RESEND_API_KEY=re_your_key_here")
            return False
            
        print("✅ RESEND_API_KEY is set")
        
        # Try to send a test email
        print("\n📧 Testing email send...")
        try:
            result = send_mail(
                subject="Legal Connect - Email Configuration Test",
                message="If you receive this, Resend email is working correctly!",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=["test@example.com"],
                fail_silently=False,
            )
            print(f"✅ Email sent successfully! (Result: {result})")
            print("\nCheck your Resend dashboard at https://resend.com/emails for delivery status.")
            return True
        except Exception as e:
            print(f"❌ ERROR sending email: {str(e)}")
            return False
            
    elif 'console' in settings.EMAIL_BACKEND.lower():
        print("\n⚠️  Console backend is configured (emails will print to console)")
        print("   For production, update .env: EMAIL_BACKEND=resend.django.backend.ResendBackend")
        return True
    else:
        print(f"\n❌ Unknown email backend: {settings.EMAIL_BACKEND}")
        return False

if __name__ == '__main__':
    success = test_resend_email()
    sys.exit(0 if success else 1)
