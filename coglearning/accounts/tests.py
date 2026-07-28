from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User


class RegisterTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('register')

    def test_register_student_ok(self):
        payload = {
            'username': 'student1',
            'password': 'StrongPass123!',
            'email': 'student1@example.com',
            'first_name': 'Stu',
            'last_name': 'Dent',
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='student1')
        self.assertEqual(user.role, 'student')

    def test_register_teacher_ok(self):
        payload = {
            'username': 'teacher1',
            'password': 'StrongPass123!',
            'email': 'teacher1@example.com',
            'role': 'teacher',
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='teacher1')
        self.assertEqual(user.role, 'teacher')

    def test_register_as_admin_rejected(self):
        payload = {
            'username': 'hacker_admin',
            'password': 'StrongPass123!',
            'email': 'admin@example.com',
            'role': 'admin',
        }
        response = self.client.post(self.url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username='hacker_admin').exists())


class LoginAndProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='profileuser',
            password='StrongPass123!',
            email='profile@example.com',
            role='student',
        )

    def test_login_returns_tokens(self):
        response = self.client.post(
            reverse('token_obtain_pair'),
            {'username': 'profileuser', 'password': 'StrongPass123!'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_profile_requires_auth_and_returns_own_data(self):
        unauth = self.client.get(reverse('profile'))
        self.assertEqual(unauth.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'profileuser')
        self.assertEqual(response.data['role'], 'student')

    def test_logout_blacklists_refresh_token(self):
        login = self.client.post(
            reverse('token_obtain_pair'),
            {'username': 'profileuser', 'password': 'StrongPass123!'},
            format='json',
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        refresh = login.data['refresh']
        access = login.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        logout = self.client.post(
            reverse('logout'),
            {'refresh': refresh},
            format='json',
        )
        self.assertIn(
            logout.status_code,
            (status.HTTP_200_OK, status.HTTP_205_RESET_CONTENT),
        )
        self.assertEqual(logout.data['detail'], 'logged out')

        refresh_again = self.client.post(
            reverse('token_refresh'),
            {'refresh': refresh},
            format='json',
        )
        self.assertEqual(refresh_again.status_code, status.HTTP_401_UNAUTHORIZED)
