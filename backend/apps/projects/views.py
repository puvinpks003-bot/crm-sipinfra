from rest_framework import viewsets, permissions
from .models import Project, SiteSurvey, NetMetering, AMC
from .serializers import ProjectSerializer, SiteSurveySerializer, NetMeteringSerializer, AMCSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().select_related('lead', 'quote', 'project_manager')
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

class SiteSurveyViewSet(viewsets.ModelViewSet):
    queryset = SiteSurvey.objects.all()
    serializer_class = SiteSurveySerializer
    permission_classes = [permissions.IsAuthenticated]

class NetMeteringViewSet(viewsets.ModelViewSet):
    queryset = NetMetering.objects.all()
    serializer_class = NetMeteringSerializer
    permission_classes = [permissions.IsAuthenticated]

class AMCViewSet(viewsets.ModelViewSet):
    queryset = AMC.objects.all()
    serializer_class = AMCSerializer
    permission_classes = [permissions.IsAuthenticated]
