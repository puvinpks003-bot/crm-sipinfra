import os
import sys
import django
import random
from datetime import datetime, timedelta

# Set up Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.utils import timezone
from apps.accounts.models import User
from apps.leads.models import Lead, Activity, FollowUp, Note
from apps.quotes.models import Quote, QuoteStatus
from apps.notifications.models import Notification

# Clear DB
print("Clearing database...")
Quote.objects.all().delete()
FollowUp.objects.all().delete()
Activity.objects.all().delete()
Note.objects.all().delete()
Notification.objects.all().delete()
Lead.objects.all().delete()
User.objects.all().delete()

# Create Users
print("Seeding users...")
users_data = [
    { 'username': 'caller@sipinfra.in', 'first_name': 'Rahul', 'last_name': 'Kumar', 'email': 'caller@sipinfra.in', 'password': 'demo1234', 'role': 'telecaller', 'avatar': 'RK', 'color': '#F59E0B', 'phone': '9876543210', 'status': 'active', 'team': 'Mumbai Alpha', 'monthly_target_kw': 20 },
    { 'username': 'priya@sipinfra.in', 'first_name': 'Priya', 'last_name': 'Sharma', 'email': 'priya@sipinfra.in', 'password': 'demo1234', 'role': 'telecaller', 'avatar': 'PS', 'color': '#14B8A6', 'phone': '9876543211', 'status': 'active', 'team': 'Mumbai Alpha', 'monthly_target_kw': 20 },
    { 'username': 'amit@sipinfra.in', 'first_name': 'Amit', 'last_name': 'Singh', 'email': 'amit@sipinfra.in', 'password': 'demo1234', 'role': 'telecaller', 'avatar': 'AS', 'color': '#A855F7', 'phone': '9876543212', 'status': 'idle', 'team': 'Pune Beta', 'monthly_target_kw': 15 },
    { 'username': 'neha@sipinfra.in', 'first_name': 'Neha', 'last_name': 'Patel', 'email': 'neha@sipinfra.in', 'password': 'demo1234', 'role': 'telecaller', 'avatar': 'NP', 'color': '#3B82F6', 'phone': '9876543213', 'status': 'busy', 'team': 'Pune Beta', 'monthly_target_kw': 20 },
    { 'username': 'vijay@sipinfra.in', 'first_name': 'Vijay', 'last_name': 'Rao', 'email': 'vijay@sipinfra.in', 'password': 'demo1234', 'role': 'telecaller', 'avatar': 'VR', 'color': '#EF4444', 'phone': '9876543214', 'status': 'active', 'team': 'Nashik Gamma', 'monthly_target_kw': 15 },
    { 'username': 'sunita@sipinfra.in', 'first_name': 'Sunita', 'last_name': 'Desai', 'email': 'sunita@sipinfra.in', 'password': 'demo1234', 'role': 'telecaller', 'avatar': 'SD', 'color': '#EC4899', 'phone': '9876543215', 'status': 'active', 'team': 'Mumbai Alpha', 'monthly_target_kw': 15 },
    { 'username': 'manager@sipinfra.in', 'first_name': 'Ravi', 'last_name': 'Gupta', 'email': 'manager@sipinfra.in', 'password': 'demo1234', 'role': 'manager', 'avatar': 'RG', 'color': '#F59E0B', 'phone': '9876543220', 'status': 'active', 'team': 'All Teams', 'monthly_target_kw': 80 },
    { 'username': 'kavita@sipinfra.in', 'first_name': 'Kavita', 'last_name': 'Joshi', 'email': 'kavita@sipinfra.in', 'password': 'demo1234', 'role': 'manager', 'avatar': 'KJ', 'color': '#14B8A6', 'phone': '9876543221', 'status': 'active', 'team': 'Pune & Nashik', 'monthly_target_kw': 50 },
    { 'username': 'admin@sipinfra.in', 'first_name': 'Admin', 'last_name': 'User', 'email': 'admin@sipinfra.in', 'password': 'demo1234', 'role': 'admin', 'avatar': 'AU', 'color': '#A855F7', 'phone': '9876543230', 'status': 'active', 'team': 'HQ', 'monthly_target_kw': 100 },
]

user_objs = {}
for u_data in users_data:
    password = u_data.pop('password')
    user = User.objects.create(**u_data)
    user.set_password(password)
    user.save()
    user_objs[user.email] = user

print(f"Seeded {len(user_objs)} users.")

# Generate some Leads
firstNames = ['Arun','Suresh','Ramesh','Mahesh','Dinesh','Rajesh','Prakash','Ganesh','Naresh','Umesh', 'Priyanka', 'Aditi', 'Rohan', 'Vikram', 'Meera', 'Karan', 'Pooja', 'Sneha', 'Rahul', 'Amit']
lastNames  = ['Patil','Jadhav','Shinde','Kulkarni','Desai','More','Pawar','Kadam','Gaikwad','Mane', 'Sharma', 'Patel', 'Singh', 'Kumar', 'Joshi', 'Gupta', 'Mehta', 'Shah', 'Verma']
sources = ['Website', 'Facebook Ad', 'Google Ad', 'Referral', 'Cold Call', 'WhatsApp', 'Exhibition']
statuses = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']
temperatures = ['Hot', 'Warm', 'Cold']
cities = ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad']

telecallers = [u for u in user_objs.values() if u.role == 'telecaller']
admin_user = user_objs['admin@sipinfra.in']

print("Seeding leads...")
for i in range(120):
    fn = random.choice(firstNames)
    ln = random.choice(lastNames)
    kw_size = random.choice([3, 5, 10, 15, 20, 50, 100])
    system_cost = kw_size * 55000
    
    # Random lead source, status, temp
    status = random.choice(statuses)
    temp = random.choice(temperatures)
    source = random.choice(sources)
    
    # 25% chance unassigned if New
    assigned_to = None
    if status != 'New' or random.random() > 0.25:
        assigned_to = random.choice(telecallers)
        
    created_at = timezone.now() - timedelta(days=random.randint(0, 30))
    
    lead = Lead.objects.create(
        name=f"{fn} {ln}",
        phone=f"9{''.join(str(random.randint(0,9)) for _ in range(9))}",
        email=f"{fn.lower()}.{ln.lower()}@example.com",
        city=random.choice(cities),
        state='Maharashtra',
        source=source,
        status=status,
        temperature=temp,
        system_type='Residential KW' if kw_size <= 20 else 'Commercial KW',
        kw_size=kw_size,
        estimated_value=system_cost,
        assigned_to=assigned_to,
        created_by=admin_user,
    )
    # Update created_at using filter to bypass auto_now_add
    Lead.objects.filter(id=lead.id).update(created_at=created_at)
    
    # Seed notes
    if random.random() > 0.3:
        Note.objects.create(
            lead=lead,
            text=f"Customer interested in {kw_size}kW system size. Discussed solar panel layouts.",
            added_by=assigned_to or admin_user
        )
        
    # Seed activities
    if status != 'New':
        Activity.objects.create(
            lead=lead,
            user=assigned_to or admin_user,
            type='Call',
            description='Customer call logged - discussed system sizing and pricing details.',
            metadata={'outcome': 'Interested', 'duration': '3 min'}
        )
        
    # Seed quotes
    if status in ['Proposal', 'Negotiation', 'Won']:
        Quote.objects.create(
            quote_number=f"Q2026{str(i).zfill(3)}",
            lead=lead,
            status=QuoteStatus.ACCEPTED if status == 'Won' else QuoteStatus.SENT,
            system_type='Residential' if kw_size <= 20 else 'Commercial',
            kw_size=kw_size,
            cost_per_kw=55000,
            system_cost=system_cost,
            install_cost=system_cost * 0.08,
            subtotal=system_cost * 1.08,
            gst_rate=0.12,
            gst_amount=system_cost * 1.08 * 0.12,
            total_cost=system_cost * 1.08 * 1.12,
            subsidy_amount=min(kw_size * 14588, 78000) if kw_size <= 20 else 0,
            net_cost=(system_cost * 1.08 * 1.12) - (min(kw_size * 14588, 78000) if kw_size <= 20 else 0),
            annual_generation_kwh=kw_size * 1400,
            electricity_rate=8,
            annual_saving=kw_size * 1400 * 8,
            payback_years=4.5,
            co2_saving_tons=kw_size * 1400 * 0.82 / 1000,
            valid_until=timezone.now() + timedelta(days=30),
            created_by=assigned_to or admin_user
        )
        
    # Seed followups
    if status in ['Contacted', 'Qualified', 'Proposal', 'Negotiation'] and random.random() > 0.4:
        followup_date = timezone.now() + timedelta(days=random.choice([-2, -1, 0, 1, 2, 3, 4, 5]))
        FollowUp.objects.create(
            lead=lead,
            type=random.choice(['Call', 'Site Visit', 'Meeting']),
            scheduled_date=followup_date,
            notes='Follow up on system sizing and pricing details.',
            assigned_to=assigned_to or admin_user,
            is_completed=followup_date < timezone.now(),
            completed_at=followup_date if followup_date < timezone.now() else None
        )

print("Database seeding completed successfully.")
