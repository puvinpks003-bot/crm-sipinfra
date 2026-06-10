from rest_framework import serializers
from .models import Lead, Note, Activity, FollowUp
from apps.accounts.serializers import UserMiniSerializer
from apps.accounts.models import User

class NoteSerializer(serializers.ModelSerializer):
    added_by_name = serializers.CharField(source='added_by.get_full_name', read_only=True)
    
    class Meta:
        model = Note
        fields = ['id', 'text', 'added_by_name', 'created_at']

class ActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Activity
        fields = ['id', 'type', 'description', 'metadata', 'user_name', 'created_at']

class FollowUpSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = FollowUp
        fields = ['id', 'type', 'scheduled_date', 'notes', 'assigned_to', 'assigned_to_name', 'is_completed', 'completed_at', 'created_at']

class LeadListSerializer(serializers.ModelSerializer):
    """Optimized serializer for list views"""
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = Lead
        fields = ['id', 'name', 'phone', 'city', 'status', 'temperature', 'source', 'kw_size', 'estimated_value', 'assigned_to_name', 'assigned_to_id', 'created_at']

class LeadDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual views, includes nested relations"""
    notes = NoteSerializer(many=True, read_only=True)
    activities = ActivitySerializer(many=True, read_only=True)
    followups = FollowUpSerializer(many=True, read_only=True)
    assigned_to = UserMiniSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
        source='assigned_to'
    )

    class Meta:
        model = Lead
        fields = '__all__'

