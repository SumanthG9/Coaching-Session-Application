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

async function searchCoaches(token, skill = '') {
  const query = skill.trim() ? `?skill=${encodeURIComponent(skill.trim())}` : '';
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
