import tempfile
from datetime import timedelta
from unittest import mock

from django.core import signing
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.matters.models import Matter
from apps.users.models import User

from .models import Document


class PrivateDownloadTests(TestCase):
    """Files sit on disk and are only reachable through a signed, expiring link."""

    def setUp(self):
        self.media = tempfile.TemporaryDirectory()
        self.override = override_settings(MEDIA_ROOT=self.media.name)
        self.override.enable()
        self.owner = User.objects.create_user(email='o@example.com', password='x' * 12, user_type='client')
        self.stranger = User.objects.create_user(email='s@example.com', password='x' * 12, user_type='client')
        matter = Matter.objects.create(client=self.owner, title='t', description='d', matter_type='civil')
        self.doc = Document.objects.create(
            matter=matter, uploaded_by=self.owner, title='Lease', original_filename='lease.pdf',
            file_type='application/pdf', file_size=4,
            file=SimpleUploadedFile('lease.pdf', b'%PDF', content_type='application/pdf'),
        )
        self.api = APIClient()

    def tearDown(self):
        self.override.disable()
        self.media.cleanup()

    def _link(self, user):
        self.api.force_authenticate(user)
        res = self.api.get(f'/api/v1/documents/{self.doc.pk}/download/')
        self.api.force_authenticate(None)
        return res

    def test_owner_gets_a_working_signed_link(self):
        res = self._link(self.owner)
        self.assertEqual(res.status_code, 200)
        self.assertIn('/file/?token=', res.data['download_url'])
        self.assertNotIn('/media/', res.data['download_url'])

        file_res = self.api.get(res.data['download_url'])
        self.assertEqual(file_res.status_code, 200)
        self.assertEqual(b''.join(file_res.streaming_content), b'%PDF')
        self.assertIn('lease.pdf', file_res['Content-Disposition'])

    def test_a_stranger_cannot_get_a_link(self):
        self.assertEqual(self._link(self.stranger).status_code, 404)

    def test_no_token_or_a_forged_token_is_404(self):
        self.assertEqual(self.api.get(f'/api/v1/documents/{self.doc.pk}/file/').status_code, 404)
        self.assertEqual(self.api.get(f'/api/v1/documents/{self.doc.pk}/file/?token=forged').status_code, 404)

    def test_a_link_cannot_be_reused_for_another_document(self):
        url = self._link(self.owner).data['download_url']
        other = Document.objects.create(
            matter=self.doc.matter, uploaded_by=self.owner, title='o', original_filename='o.pdf',
            file_type='application/pdf', file_size=1, file=SimpleUploadedFile('o.pdf', b'x'),
        )
        token = url.split('token=')[1]
        self.assertEqual(self.api.get(f'/api/v1/documents/{other.pk}/file/?token={token}').status_code, 404)

    def test_an_expired_link_is_404(self):
        url = self._link(self.owner).data['download_url']
        with mock.patch('django.core.signing.time.time', return_value=__import__('time').time() + 2 * 3600):
            self.assertEqual(self.api.get(url).status_code, 404)
