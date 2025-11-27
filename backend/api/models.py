from django.db import models


class Team(models.Model):
    """Team model representing different teams in the project"""
    name_en = models.CharField(max_length=100, unique=True)
    name_es = models.CharField(max_length=100, unique=True)
    image_url = models.CharField(max_length=300, null=True, blank=True)
    image = models.ImageField(upload_to='teams/', null=True, blank=True)

    class Meta:
        db_table = 'teams'
        ordering = ['id']

    def __str__(self):
        return self.name_en

    def to_dict(self):
        """Return team data as dictionary"""
        # Use uploaded image if available, otherwise fall back to image_url
        team_image = self.image.url if self.image else self.image_url
        
        return {
            'id': self.id,
            'name_en': self.name_en,
            'name_es': self.name_es,
            'image_url': team_image
        }


class Member(models.Model):
    """Member model representing team members with authentication"""
    name = models.CharField(max_length=200)
    email = models.EmailField(max_length=200, unique=True, null=True, blank=True)
    password_hash = models.CharField(max_length=255, null=True, blank=True)
    career_en = models.CharField(max_length=200)
    career_es = models.CharField(max_length=200)
    role_en = models.CharField(max_length=100)
    role_es = models.CharField(max_length=100)
    charge_en = models.CharField(max_length=200)
    charge_es = models.CharField(max_length=200)
    image_url = models.CharField(max_length=300, null=True, blank=True)
    image = models.ImageField(upload_to='members/', null=True, blank=True)
    is_team_leader = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='members',
        db_column='team_id'
    )

    class Meta:
        db_table = 'members'
        ordering = ['id']

    def __str__(self):
        return self.name

    def set_password(self, raw_password):
        """Hash password using bcrypt"""
        import bcrypt
        salt = bcrypt.gensalt(rounds=12)
        self.password_hash = bcrypt.hashpw(raw_password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, raw_password):
        """Verify password against hash"""
        import bcrypt
        return bcrypt.checkpw(
            raw_password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )

    def to_dict(self, language='en', include_email=False):
        """Return member data as dictionary for specified language"""
        # Use uploaded image if available, otherwise fall back to image_url
        image_url = self.image.url if self.image else self.image_url
        
        data = {
            'id': self.id,
            'name': self.name,
            'career': self.career_en if language == 'en' else self.career_es,
            'role': self.role_en if language == 'en' else self.role_es,
            'charge': self.charge_en if language == 'en' else self.charge_es,
            'image_url': image_url,
            'team_id': self.team.id,
            'team_name': self.team.name_en if language == 'en' else self.team.name_es,
            'is_team_leader': self.is_team_leader
        }
        
        # Only include email for authenticated requests
        if include_email:
            data['email'] = self.email
            
        return data


class Publication(models.Model):
    """Publication model for team publications and posts"""
    title_en = models.CharField(max_length=300)
    title_es = models.CharField(max_length=300)
    content_en = models.TextField()
    content_es = models.TextField()
    publication_date = models.DateField(auto_now_add=True)
    image_url = models.CharField(max_length=500, null=True, blank=True)
    author = models.ForeignKey(
        Member,
        on_delete=models.SET_NULL,
        null=True,
        related_name='publications',
        db_column='author_id'
    )
    team = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='publications',
        db_column='team_id'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'publications'
        ordering = ['-publication_date', 'id']

    def __str__(self):
        return self.title_en

    def to_dict(self, language='en'):
        """Return publication data as dictionary for specified language"""
        return {
            'id': self.id,
            'title': self.title_en if language == 'en' else self.title_es,
            'content': self.content_en if language == 'en' else self.content_es,
            'publication_date': self.publication_date.isoformat(),
            'image_url': self.image_url,
            'author_id': self.author.id if self.author else None,
            'author_name': self.author.name if self.author else None,
            'team_id': self.team.id if self.team else None,
            'team_name': (self.team.name_en if language == 'en' else self.team.name_es) if self.team else None,
            'created_at': self.created_at.isoformat() if hasattr(self, 'created_at') else None,
            'updated_at': self.updated_at.isoformat() if hasattr(self, 'updated_at') else None
        }


class RedSocial(models.Model):
    """Social media links for team members"""
    link = models.CharField(max_length=300, unique=True)
    icon_url = models.CharField(max_length=300)
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name='social_links',
        db_column='member_id'
    )

    class Meta:
        db_table = 'red_social'
        ordering = ['id']

    def __str__(self):
        return f"{self.member.name} - {self.link}"

    def to_dict(self):
        """Return social media data as dictionary"""
        return {
            'id': self.id,
            'link': self.link,
            'icon_url': self.icon_url,
            'member_id': self.member.id,
            'member_name': self.member.name
        }
