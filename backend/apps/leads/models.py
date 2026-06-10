from django.db import models
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.accounts.models import User

class LeadStatus(models.TextChoices):
    NEW = 'New', 'New'
    CONTACTED = 'Contacted', 'Contacted'
    QUALIFIED = 'Qualified', 'Qualified'
    PROPOSAL = 'Proposal', 'Proposal'
    NEGOTIATION = 'Negotiation', 'Negotiation'
    WON = 'Won', 'Won'
    LOST = 'Lost', 'Lost'

class LeadTemperature(models.TextChoices):
    HOT = 'Hot', 'Hot'
    WARM = 'Warm', 'Warm'
    COLD = 'Cold', 'Cold'

class LeadSource(models.TextChoices):
    WEBSITE = 'Website', 'Website'
    FACEBOOK = 'Facebook Ad', 'Facebook Ad'
    GOOGLE = 'Google Ad', 'Google Ad'
    REFERRAL = 'Referral', 'Referral'
    COLD_CALL = 'Cold Call', 'Cold Call'
    WHATSAPP = 'WhatsApp', 'WhatsApp'
    EXHIBITION = 'Exhibition', 'Exhibition'
    NEWSPAPER = 'Newspaper Ad', 'Newspaper Ad'
    TV = 'TV Ad', 'TV Ad'
    OTHER = 'Other', 'Other'

class Lead(TimeStampedModel, SoftDeleteModel):
    # Contact Info
    name = models.CharField(max_length=255, db_index=True)
    phone = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(blank=True, null=True, db_index=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=20, blank=True, null=True)
    
    # Metadata
    source = models.CharField(max_length=50, choices=LeadSource.choices, default=LeadSource.OTHER, db_index=True)
    status = models.CharField(max_length=50, choices=LeadStatus.choices, default=LeadStatus.NEW, db_index=True)
    temperature = models.CharField(max_length=20, choices=LeadTemperature.choices, default=LeadTemperature.WARM, db_index=True)
    score = models.IntegerField(default=0, help_text="Automated lead score out of 100")
    
    # Requirements
    system_type = models.CharField(max_length=100, blank=True, null=True) # Residential, Commercial, Industrial
    kw_size = models.FloatField(default=0, db_index=True)
    
    # Financials (High level estimates, detailed in Quote)
    estimated_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Tracking
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_leads')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_leads')
    last_contact = models.DateTimeField(null=True, blank=True)
    next_follow_up = models.DateTimeField(null=True, blank=True, db_index=True)
    
    # SLAs
    sla_breached = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'leads_lead'
        constraints = [
            # Ensure we don't have duplicate phone numbers for active leads
            models.UniqueConstraint(fields=['phone'], condition=models.Q(is_deleted=False), name='unique_active_phone')
        ]

    def __str__(self):
        return f"{self.name} ({self.phone})"

class Note(TimeStampedModel, SoftDeleteModel):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='notes')
    text = models.TextField()
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'leads_note'
        ordering = ['-created_at']

class ActivityType(models.TextChoices):
    CALL = 'Call', 'Call'
    EMAIL = 'Email', 'Email'
    WHATSAPP = 'WhatsApp', 'WhatsApp'
    NOTE = 'Note', 'Note Added'
    STATUS_CHANGE = 'Status Change', 'Status Changed'
    SYSTEM = 'System', 'System Event'

class Activity(TimeStampedModel):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    type = models.CharField(max_length=50, choices=ActivityType.choices)
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'leads_activity'
        ordering = ['-created_at']

class FollowUp(TimeStampedModel, SoftDeleteModel):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='followups')
    type = models.CharField(max_length=50) # Call, Meeting, Site Visit
    scheduled_date = models.DateTimeField(db_index=True)
    notes = models.TextField(blank=True, null=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_followups')
    is_completed = models.BooleanField(default=False, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'leads_followup'
        ordering = ['scheduled_date']
