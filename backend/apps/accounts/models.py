from django.db import models
from django.contrib.auth.models import AbstractUser
from apps.core.models import TimeStampedModel, SoftDeleteModel

class Role(models.TextChoices):
    ADMIN = 'admin', 'Admin'
    MANAGER = 'manager', 'Manager'
    TELECALLER = 'telecaller', 'Telecaller'
    SALES_EXEC = 'sales_exec', 'Sales Executive'
    PROJECT_COORD = 'project_coord', 'Project Coordinator'

class User(AbstractUser, TimeStampedModel, SoftDeleteModel):
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.TELECALLER, db_index=True)
    avatar = models.CharField(max_length=5, blank=True)
    color = models.CharField(max_length=20, default='#F59E0B')
    phone = models.CharField(max_length=20, blank=True, db_index=True)
    status = models.CharField(max_length=20, default='active', db_index=True)
    team = models.CharField(max_length=50, blank=True, db_index=True)
    monthly_target_kw = models.IntegerField(default=50) # Target in KW instead of just count
    
    class Meta:
        db_table = 'accounts_user'

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)

    @property
    def is_admin(self):
        return self.role == Role.ADMIN
        
    @property
    def is_manager(self):
        return self.role in [Role.ADMIN, Role.MANAGER]

class Team(TimeStampedModel, SoftDeleteModel):
    name = models.CharField(max_length=100, unique=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_teams')
    members = models.ManyToManyField(User, related_name='team_memberships', blank=True)
    region = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name
