import random
from datetime import timedelta
from django.utils import timezone
from apps.leads.models import Lead, LeadSource, LeadStatus, LeadTemperature
from apps.accounts.models import User

# Sample Data
CITIES = ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Ahmedabad', 'Surat']
NAMES = ['Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Advik', 'Kabir', 'Anaya', 'Aarohi', 'Shruti', 'Rahul', 'Rohan', 'Sneha', 'Priya', 'Amit', 'Neha', 'Karan', 'Pooja', 'Vikram', 'Meera']
SURNAMES = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Desai', 'Joshi', 'Gupta', 'Mehta', 'Shah', 'Verma']
SYSTEM_TYPES = ['Residential KW', 'Commercial MW', 'Industrial MW', 'Agricultural Pump']

def seed():
    telecallers = list(User.objects.filter(role='telecaller'))
    if not telecallers:
        telecallers = list(User.objects.all()) # Fallback to any users
        
    admin_user = User.objects.filter(role='admin').first() or telecallers[0]
    
    leads_to_create = []
    
    for _ in range(25):
        first_name = random.choice(NAMES)
        last_name = random.choice(SURNAMES)
        name = f"{first_name} {last_name}"
        phone = f"98{random.randint(10000000, 99999999)}"
        city = random.choice(CITIES)
        kw_size = random.choice([3, 5, 10, 15, 20, 50, 100])
        system_type = random.choice(SYSTEM_TYPES)
        source = random.choice([choice[0] for choice in LeadSource.choices])
        status = random.choice([choice[0] for choice in LeadStatus.choices])
        temp = random.choice([choice[0] for choice in LeadTemperature.choices])
        
        system_cost = kw_size * 55000
        assigned_to = random.choice(telecallers) if telecallers else None
        
        created_at = timezone.now() - timedelta(days=random.randint(0, 30))
        
        lead = Lead(
            name=name,
            phone=phone,
            email=f"{first_name.lower()}@example.com",
            city=city,
            kw_size=kw_size,
            system_type=system_type,
            source=source,
            status=status,
            temperature=temp,
            estimated_value=system_cost,
            assigned_to=assigned_to,
            created_by=admin_user,
        )
        lead.save()
        lead.created_at = created_at
        lead.save()
        print(f"Created Lead: {name} - {city} - {kw_size}kW")

if __name__ == '__main__':
    seed()
