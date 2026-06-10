from django.db import models
from apps.core.models import TimeStampedModel
from apps.accounts.models import User

class Notification(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50) # System, LeadAssigned, QuoteApproved, SLA_Breached
    title = models.CharField(max_length=255)
    message = models.TextField()
    icon = models.CharField(max_length=10, default='??')
    color = models.CharField(max_length=20, default='#F59E0B')
    is_read = models.BooleanField(default=False, db_index=True)
    link = models.CharField(max_length=255, blank=True) # Deep link to entity
    
    class Meta:
        db_table = 'notifications_notification'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"
