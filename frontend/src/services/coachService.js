import { apiRequestWithToken } from './api';

async function getCoachProfile(token) {
  return apiRequestWithToken('/coaches/me', token);
}

async function updateCoachProfile(token, profileData) {
  return apiRequestWithToken('/coaches/me', token, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

async function getCoachSkills(token) {
  return apiRequestWithToken('/coaches/me/skills', token);
}

async function addCoachSkill(token, skillName) {
  return apiRequestWithToken('/coaches/me/skills', token, {
    method: 'POST',
    body: JSON.stringify({ skill_name: skillName }),
  });
}

async function deleteCoachSkill(token, skillId) {
  return apiRequestWithToken(`/coaches/me/skills/${skillId}`, token, {
    method: 'DELETE',
  });
}

async function searchCoaches(token, skill = '', limit = 10) {
  const params = new URLSearchParams();
  if (skill.trim()) params.append('skill', skill.trim());
  if (limit) params.append('limit', limit.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequestWithToken(`/coaches${query}`, token);
}

async function getCoachDetails(token, coachId) {
  return apiRequestWithToken(`/coaches/${coachId}`, token);
}

export {
  getCoachProfile,
  updateCoachProfile,
  getCoachSkills,
  addCoachSkill,
  deleteCoachSkill,
  searchCoaches,
  getCoachDetails,
};
