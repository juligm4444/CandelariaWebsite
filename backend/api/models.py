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
    """Member model representing team members"""
    name = models.CharField(max_length=200)
    career_en = models.CharField(max_length=200)
    career_es = models.CharField(max_length=200)
    role_en = models.CharField(max_length=100)
    role_es = models.CharField(max_length=100)
    charge_en = models.CharField(max_length=200)
    charge_es = models.CharField(max_length=200)
    image_url = models.CharField(max_length=300, null=True, blank=True)
    image = models.ImageField(upload_to='members/', null=True, blank=True)  # For file uploads
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

    def to_dict(self, language='en'):
        """Return member data as dictionary for specified language"""
        # Use uploaded image if available, otherwise fall back to image_url
        image_url = self.image.url if self.image else self.image_url
        
        return {
            'id': self.id,
            'name': self.name,
            'career': self.career_en if language == 'en' else self.career_es,
            'role': self.role_en if language == 'en' else self.role_es,
            'charge': self.charge_en if language == 'en' else self.charge_es,
            'image_url': image_url,
            'team_id': self.team.id,
            'team_name': self.team.name_en if language == 'en' else self.team.name_es
        }


class Admin(models.Model):
    """Admin model for team leaders who can login and manage content"""
    member = models.OneToOneField(
        Member,
        on_delete=models.CASCADE,
        related_name='admin_profile',
        db_column='member_id'
    )
    email = models.EmailField(max_length=200, unique=True)
    password_hash = models.CharField(max_length=255)
    # Note: No separate salt field needed! Bcrypt stores salt within the hash

    class Meta:
        db_table = 'admins'
        ordering = ['id']

    def __str__(self):
        return f"Admin: {self.email}"

    def to_dict(self):
        """Return admin data as dictionary"""
        return {
            'id': self.id,
            'member_id': self.member.id,
            'member_name': self.member.name,
            'email': self.email
        }

    def set_password(self, password):
        """
        Hash a password using bcrypt and store it.
        Bcrypt automatically generates a unique salt for each password.
        
        Usage:
            admin = Admin(member=member, email='test@example.com')
            admin.set_password('mypassword')
            admin.save()
        """
        import bcrypt
        # bcrypt requires bytes
        password_bytes = password.encode('utf-8')
        # Generate salt and hash (salt is included in the hash)
        salt = bcrypt.gensalt(rounds=12)  # rounds=12 is good balance of security/speed
        hashed = bcrypt.hashpw(password_bytes, salt)
        # Store as string
        self.password_hash = hashed.decode('utf-8')

    def check_password(self, password):
        """
        Check if the provided password matches the stored bcrypt hash.
        Bcrypt automatically extracts the salt from the stored hash.
        
        Returns:
            bool: True if password matches, False otherwise
            
        Usage:
            if admin.check_password('mypassword'):
                # Login successful
        """
        import bcrypt
        password_bytes = password.encode('utf-8')
        hash_bytes = self.password_hash.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)


class Publication(models.Model):
    """Publication model for team publications and posts"""
    title_en = models.CharField(max_length=300, unique=True)
    title_es = models.CharField(max_length=300, unique=True)
    content_en = models.TextField()
    content_es = models.TextField()
    publication_date = models.DateField()
    image_url = models.CharField(max_length=500, null=True, blank=True)
    team = models.ForeignKey(
        Team,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='publications',
        db_column='team_id'
    )

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
            'team_id': self.team.id if self.team else None,
            'team_name': (self.team.name_en if language == 'en' else self.team.name_es) if self.team else None
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
