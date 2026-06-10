from django.db import models
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.leads.models import Lead
from apps.accounts.models import User

class QuoteStatus(models.TextChoices):
    DRAFT = 'Draft', 'Draft'
    PENDING_APPROVAL = 'Pending Approval', 'Pending Approval'
    SENT = 'Sent', 'Sent'
    ACCEPTED = 'Accepted', 'Accepted'
    REJECTED = 'Rejected', 'Rejected'
    EXPIRED = 'Expired', 'Expired'

class SystemType(models.TextChoices):
    RESIDENTIAL = 'Residential', 'Residential'
    COMMERCIAL = 'Commercial', 'Commercial'
    INDUSTRIAL = 'Industrial', 'Industrial'

class Quote(TimeStampedModel, SoftDeleteModel):
    quote_number = models.CharField(max_length=50, unique=True, db_index=True)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='quotes')
    status = models.CharField(max_length=50, choices=QuoteStatus.choices, default=QuoteStatus.DRAFT, db_index=True)
    
    # Configuration
    system_type = models.CharField(max_length=50, choices=SystemType.choices)
    kw_size = models.FloatField()
    panel_tier = models.CharField(max_length=50, default='Standard') # Standard, Premium, Tier-1
    inverter_type = models.CharField(max_length=50, default='String') # String, Micro, Central
    battery_kwh = models.FloatField(default=0)
    
    # Financials
    cost_per_kw = models.DecimalField(max_digits=10, decimal_places=2)
    system_cost = models.DecimalField(max_digits=12, decimal_places=2)
    install_cost = models.DecimalField(max_digits=12, decimal_places=2)
    battery_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    amc_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    gst_rate = models.DecimalField(max_digits=5, decimal_places=2) # e.g., 0.12 or 0.18
    gst_amount = models.DecimalField(max_digits=12, decimal_places=2)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)
    
    subsidy_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_cost = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Performance Metrics
    annual_generation_kwh = models.FloatField()
    electricity_rate = models.DecimalField(max_digits=6, decimal_places=2)
    tariff_escalation_rate = models.DecimalField(max_digits=5, decimal_places=4, default=0.03) # 3%
    annual_saving = models.DecimalField(max_digits=12, decimal_places=2)
    payback_years = models.FloatField()
    co2_saving_tons = models.FloatField()
    
    # Metadata
    valid_until = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_quotes')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='approved_quotes', blank=True)
    terms_conditions = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'quotes_quote'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quote_number} - {self.lead.name}"
