from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand, CommandError

from api.storage import SupabaseStorage


class Command(BaseCommand):
    help = 'Upload files from MEDIA_ROOT to Supabase Storage while preserving their relative paths.'

    def add_arguments(self, parser):
        parser.add_argument('--overwrite', action='store_true', help='Overwrite objects that already exist in Supabase Storage.')
        parser.add_argument('--dry-run', action='store_true', help='List the files that would be uploaded without sending them.')

    def handle(self, *args, **options):
        if not getattr(settings, 'USE_SUPABASE_STORAGE', False):
            raise CommandError('Supabase storage is not configured. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET.')

        media_root = Path(settings.MEDIA_ROOT)
        if not media_root.exists():
            raise CommandError(f'MEDIA_ROOT does not exist: {media_root}')

        files = sorted(path for path in media_root.rglob('*') if path.is_file())
        if not files:
            self.stdout.write(self.style.WARNING(f'No files found under {media_root}.'))
            return

        storage = SupabaseStorage()
        uploaded = 0
        skipped = 0

        for file_path in files:
            relative_name = file_path.relative_to(media_root).as_posix()
            if options['dry_run']:
                self.stdout.write(f'[dry-run] {relative_name}')
                continue

            if storage.exists(relative_name) and not options['overwrite']:
                skipped += 1
                self.stdout.write(f'[skip] {relative_name}')
                continue

            with file_path.open('rb') as handle:
                storage.upload_file(relative_name, File(handle, name=relative_name), upsert=options['overwrite'])

            uploaded += 1
            self.stdout.write(f'[uploaded] {relative_name}')

        if options['dry_run']:
            self.stdout.write(self.style.SUCCESS(f'Dry run complete. {len(files)} files would be uploaded.'))
            return

        self.stdout.write(self.style.SUCCESS(f'Sync complete. Uploaded: {uploaded}, skipped: {skipped}.'))
