from rest_framework import serializers
from .models import Project, SiteSurvey, NetMetering, AMC

class ProjectSerializer(serializers.ModelSerializer):
    lead_name = serializers.CharField(source='lead.name', read_only=True)
    manager_name = serializers.CharField(source='project_manager.get_full_name', read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

class SiteSurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSurvey
        fields = '__all__'

class NetMeteringSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetMetering
        fields = '__all__'

class AMCSerializer(serializers.ModelSerializer):
    class Meta:
        model = AMC
        fields = '__all__'
