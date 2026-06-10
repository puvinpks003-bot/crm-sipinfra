from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Lead, Note, Activity, FollowUp
from .serializers import LeadListSerializer, LeadDetailSerializer, NoteSerializer, ActivitySerializer, FollowUpSerializer
from apps.core.permissions import IsManagerOrAdmin, IsAssignedToLeadOrManager
from apps.accounts.models import Role

class LeadViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'temperature', 'source', 'assigned_to']
    search_fields = ['name', 'phone', 'email', 'city']
    ordering_fields = ['created_at', 'score', 'estimated_value', 'next_follow_up']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['destroy']:
            permission_classes = [IsManagerOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        # Base Queryset with Soft Delete manager
        qs = Lead.objects.all()
        
        # RBAC: Telecallers only see their own leads
        if getattr(user, 'role', Role.TELECALLER) not in [Role.MANAGER, Role.ADMIN]:
            qs = qs.filter(assigned_to=user)

        # Optimize for List vs Detail views
        if self.action == 'list':
            return qs.select_related('assigned_to')
        return qs.select_related('assigned_to', 'created_by').prefetch_related(
            'notes', 'notes__added_by', 
            'activities', 'activities__user', 
            'followups', 'followups__assigned_to'
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return LeadListSerializer
        return LeadDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all().select_related('added_by', 'lead')
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all().select_related('user', 'lead')
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FollowUpViewSet(viewsets.ModelViewSet):
    queryset = FollowUp.objects.all().select_related('assigned_to', 'lead')
    serializer_class = FollowUpSerializer
    permission_classes = [permissions.IsAuthenticated]
