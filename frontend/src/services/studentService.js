import { apiRequestWithToken } from './api';

async function getStudentProfile(token) {
  return apiRequestWithToken('/students/me', token);
}

async function updateStudentProfile(token, profileData) {
  return apiRequestWithToken('/students/me', token, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

export { getStudentProfile, updateStudentProfile };
