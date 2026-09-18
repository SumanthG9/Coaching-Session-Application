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

async function registerUser(name, email, password, role) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
      role,
    }),
  });
}

async function registerStudent(name, email, password) {
  return registerUser(name, email, password, 'student');
}

async function registerCoach(name, email, password) {
  return registerUser(name, email, password, 'coach');
}

async function getCurrentUser(token) {
  return apiRequestWithToken('/auth/me', token);
}

export { login, registerUser, registerStudent, registerCoach, getCurrentUser };