from django.core.management.base import BaseCommand
from api.models import Team, TeamLeaderWhitelist

class Command(BaseCommand):
    help = 'Add team leaders to the whitelist'

    def add_arguments(self, parser):
        parser.add_argument(
            '--team',
            type=str,
            help='Team name or ID',
            required=True
        )
        parser.add_argument(
            '--email',
            type=str,
            help='Leader email address',
            required=True
        )
        parser.add_argument(
            '--first-name',
            type=str,
            help='Leader first name',
            required=True
        )
        parser.add_argument(
            '--last-name',
            type=str,
            help='Leader last name',
            required=True
        )

    def handle(self, *args, **options):
        try:
            # Find team by name or ID
            team_identifier = options['team']
            try:
                team = Team.objects.get(id=int(team_identifier))
            except (ValueError, Team.DoesNotExist):
                team = Team.objects.get(name_en__icontains=team_identifier)
            
            # Create whitelist entry
            whitelist_entry, created = TeamLeaderWhitelist.objects.get_or_create(
                email=options['email'].lower().strip(),
                defaults={
                    'team': team,
                    'first_name': options['first_name'],
                    'last_name': options['last_name'],
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✅ Added {options["email"]} as team leader for {team.name_en}'
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'⚠️  {options["email"]} is already in the whitelist'
                    )
                )
                
        except Team.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'❌ Team "{options["team"]}" not found')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error: {str(e)}')
            )