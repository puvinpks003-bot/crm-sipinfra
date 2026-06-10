from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User, Role
from apps.leads.models import Lead

class LeadAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.manager = User.objects.create_user(
            username='manager@test.com',
            email='manager@test.com',
            password='testpassword',
            role=Role.MANAGER
        )
        self.telecaller = User.objects.create_user(
            username='caller@test.com',
            email='caller@test.com',
            password='testpassword',
            role=Role.TELECALLER
        )
        
        self.lead1 = Lead.objects.create(name='John Doe', phone='1234567890', assigned_to=self.telecaller)
        self.lead2 = Lead.objects.create(name='Jane Smith', phone='0987654321', assigned_to=self.manager)

    def test_unauthorized_access(self):
        url = reverse('lead-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manager_can_see_all_leads(self):
        self.client.force_authenticate(user=self.manager)
        url = reverse('lead-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_telecaller_can_only_see_assigned_leads(self):
        self.client.force_authenticate(user=self.telecaller)
        url = reverse('lead-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], 'John Doe')

    def test_telecaller_cannot_delete_lead(self):
        self.client.force_authenticate(user=self.telecaller)
        url = reverse('lead-detail', args=[self.lead1.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_manager_can_delete_lead(self):
        self.client.force_authenticate(user=self.manager)
        url = reverse('lead-detail', args=[self.lead1.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        # Verify soft delete
        self.lead1.refresh_from_db()
        self.assertTrue(self.lead1.is_deleted)
