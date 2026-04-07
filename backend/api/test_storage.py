from io import BytesIO
from unittest.mock import patch
from urllib.error import HTTPError

from django.core.files.base import ContentFile
from django.test import SimpleTestCase

from api.storage import SupabaseStorage


class _DummyResponse:
    def __init__(self, headers=None, body=b''):
        self.headers = headers or {}
        self._body = body

    def read(self):
        return self._body


class SupabaseStorageTests(SimpleTestCase):
    def setUp(self):
        self.storage = SupabaseStorage(
            bucket_name='media',
            supabase_url='https://example.supabase.co',
            service_role_key='service-role-key',
        )

    def test_url_returns_public_bucket_path(self):
        url = self.storage.url('members/Profile Photo.png')

        self.assertEqual(
            url,
            'https://example.supabase.co/storage/v1/object/public/media/members/Profile%20Photo.png',
        )

    def test_save_uploads_binary_content(self):
        content = ContentFile(b'abc123', name='avatar.png')

        with patch.object(self.storage, 'exists', return_value=False), patch.object(
            self.storage,
            '_request',
            return_value=_DummyResponse(),
        ) as request_mock:
            saved_name = self.storage.save('members/avatar.png', content)

        self.assertEqual(saved_name, 'members/avatar.png')
        request_mock.assert_called_once()
        method, url = request_mock.call_args.args[:2]
        self.assertEqual(method, 'POST')
        self.assertEqual(
            url,
            'https://example.supabase.co/storage/v1/object/media/members/avatar.png',
        )
        self.assertEqual(request_mock.call_args.kwargs['data'], b'abc123')
        self.assertEqual(request_mock.call_args.kwargs['headers']['x-upsert'], 'false')

    def test_exists_returns_false_for_missing_object(self):
        missing = HTTPError(
            url='https://example.supabase.co/storage/v1/object/media/members/missing.png',
            code=404,
            msg='Not Found',
            hdrs={},
            fp=BytesIO(b''),
        )

        with patch.object(self.storage, '_request', side_effect=missing):
            self.assertFalse(self.storage.exists('members/missing.png'))
