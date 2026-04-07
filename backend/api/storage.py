import mimetypes
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible


@deconstructible
class SupabaseStorage(Storage):
    def __init__(self, bucket_name=None, supabase_url=None, service_role_key=None):
        self.bucket_name = bucket_name or settings.SUPABASE_STORAGE_BUCKET
        self.supabase_url = (supabase_url or settings.SUPABASE_URL).rstrip('/')
        self.service_role_key = service_role_key or settings.SUPABASE_SERVICE_ROLE_KEY
        self.upload_base_url = f"{self.supabase_url}/storage/v1/object/{self.bucket_name}"
        self.public_base_url = f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}"

    def _normalize_name(self, name):
        return str(Path(name).as_posix()).lstrip('/')

    def _build_public_url(self, name):
        normalized_name = self._normalize_name(name)
        return f"{self.public_base_url}/{quote(normalized_name, safe='/')}"

    def _build_object_url(self, name):
        normalized_name = self._normalize_name(name)
        return f"{self.upload_base_url}/{quote(normalized_name, safe='/')}"

    def _authorized_headers(self, extra_headers=None):
        headers = {
            'Authorization': f"Bearer {self.service_role_key}",
            'apikey': self.service_role_key,
        }
        if extra_headers:
            headers.update(extra_headers)
        return headers

    def _request(self, method, url, data=None, headers=None):
        request = Request(url, data=data, headers=headers or {}, method=method)
        return urlopen(request, timeout=30)

    def _read_content(self, content):
        if hasattr(content, 'seek'):
            content.seek(0)
        return content.read()

    def _content_type(self, name, content):
        guessed_type = getattr(content, 'content_type', None)
        if guessed_type:
            return guessed_type
        mime_type, _ = mimetypes.guess_type(name)
        return mime_type or 'application/octet-stream'

    def upload_file(self, name, content, upsert=False):
        normalized_name = self._normalize_name(name)
        payload = self._read_content(content)
        headers = self._authorized_headers(
            {
                'Content-Type': self._content_type(normalized_name, content),
                'x-upsert': 'true' if upsert else 'false',
                'Cache-Control': '3600',
            }
        )
        try:
            response = self._request('POST', self._build_object_url(normalized_name), data=payload, headers=headers)
            response.read()
        except HTTPError as exc:
            message = exc.read().decode('utf-8', errors='ignore')
            raise OSError(f"Supabase upload failed for {normalized_name}: {exc.code} {message}") from exc
        except URLError as exc:
            raise OSError(f"Supabase upload failed for {normalized_name}: {exc.reason}") from exc
        return normalized_name

    def _save(self, name, content):
        normalized_name = self.get_available_name(self._normalize_name(name), max_length=getattr(content, 'max_length', None))
        return self.upload_file(normalized_name, content, upsert=False)

    def delete(self, name):
        if not name:
            return
        try:
            response = self._request(
                'DELETE',
                self._build_object_url(name),
                headers=self._authorized_headers(),
            )
            response.read()
        except HTTPError as exc:
            if exc.code != 404:
                message = exc.read().decode('utf-8', errors='ignore')
                raise OSError(f"Supabase delete failed for {name}: {exc.code} {message}") from exc

    def exists(self, name):
        try:
            response = self._request(
                'HEAD',
                self._build_object_url(name),
                headers=self._authorized_headers(),
            )
            response.read()
            return True
        except HTTPError as exc:
            if exc.code == 404:
                return False
            message = exc.read().decode('utf-8', errors='ignore')
            raise OSError(f"Supabase exists check failed for {name}: {exc.code} {message}") from exc
        except URLError as exc:
            raise OSError(f"Supabase exists check failed for {name}: {exc.reason}") from exc

    def url(self, name):
        if not name:
            return ''
        return self._build_public_url(name)

    def size(self, name):
        try:
            response = self._request(
                'HEAD',
                self._build_object_url(name),
                headers=self._authorized_headers(),
            )
            return int(response.headers.get('Content-Length', '0'))
        except HTTPError as exc:
            if exc.code == 404:
                raise FileNotFoundError(name) from exc
            message = exc.read().decode('utf-8', errors='ignore')
            raise OSError(f"Supabase size lookup failed for {name}: {exc.code} {message}") from exc

    def _open(self, name, mode='rb'):
        if 'r' not in mode:
            raise NotImplementedError('SupabaseStorage only supports read mode when opening files.')
        try:
            response = self._request('GET', self.url(name))
            return ContentFile(response.read(), name=self._normalize_name(name))
        except HTTPError as exc:
            if exc.code == 404:
                raise FileNotFoundError(name) from exc
            message = exc.read().decode('utf-8', errors='ignore')
            raise OSError(f"Supabase open failed for {name}: {exc.code} {message}") from exc

    def path(self, name):
        raise NotImplementedError('SupabaseStorage does not provide local filesystem paths.')
