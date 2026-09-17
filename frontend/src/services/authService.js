import { apiRequest, apiRequestWithToken } from './api';

async function login(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

async function registerStudent(name, email, password) {
  return apiRequest('/auth/register/student', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
      role: 'student',
    }),
  });
}

async function registerCoach(name, email, password) {
  return apiRequest('/auth/register/coach', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
      role: 'coach',
    }),
  });
}

async function getCurrentUser(token) {
  return apiRequestWithToken('/auth/me', token);
}

export { login, registerStudent, registerCoach, getCurrentUser };