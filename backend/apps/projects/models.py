from django.db import models
from apps.core.models import TimeStampedModel, SoftDeleteModel
from apps.leads.models import Lead
from apps.quotes.models import Quote
from apps.accounts.models import User

class ProjectStatus(models.TextChoices):
    INITIATED = 'Initiated', 'Initiated'
    SURVEY_PENDING = 'Survey Pending', 'Site Survey Pending'
    ENGINEERING = 'Engineering', 'Engineering & Design'
    MATERIAL_PROCUREMENT = 'Procurement', 'Material Procurement'
    INSTALLATION = 'Installation', 'Installation Ongoing'
    TESTING = 'Testing', 'Testing & Commissioning'
    NET_METERING = 'Net Metering', 'Net Metering Approval'
    COMPLETED = 'Completed', 'Completed & Handed Over'

class Project(TimeStampedModel, SoftDeleteModel):
    project_code = models.CharField(max_length=50, unique=True, db_index=True)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='projects')
    quote = models.ForeignKey(Quote, on_delete=models.SET_NULL, null=True, related_name='projects')
    
    status = models.CharField(max_length=50, choices=ProjectStatus.choices, default=ProjectStatus.INITIATED, db_index=True)
    
    project_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='managed_projects')
    installer_team = models.CharField(max_length=100, blank=True)
    
    estimated_start_date = models.DateField(null=True, blank=True)
    estimated_completion_date = models.DateField(null=True, blank=True)
    actual_completion_date = models.DateField(null=True, blank=True)
    
    remarks = models.TextField(blank=True)

    class Meta:
        db_table = 'projects_project'

    def __str__(self):
        return f"{self.project_code} - {self.lead.name}"

class SiteSurvey(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='surveys')
    scheduled_date = models.DateTimeField()
    surveyor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    roof_type = models.CharField(max_length=100) # Flat, Pitched, Tin
    available_area_sqft = models.FloatField()
    shading_percentage = models.FloatField(default=0)
    structural_integrity = models.CharField(max_length=100) # Good, Needs Reinforcement
    
    notes = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        db_table = 'projects_survey'

class NetMetering(TimeStampedModel):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='net_metering')
    discom_name = models.CharField(max_length=100)
    application_number = models.CharField(max_length=100, blank=True)
    application_date = models.DateField(null=True, blank=True)
    approval_date = models.DateField(null=True, blank=True)
    meter_installation_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=50, default='Pending') # Pending, Submitted, Approved, Installed

    class Meta:
        db_table = 'projects_net_metering'

class AMC(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='amc_contracts')
    start_date = models.DateField()
    end_date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='Active') # Active, Expired, Renewed

    class Meta:
        db_table = 'projects_amc'
