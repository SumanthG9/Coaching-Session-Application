import { apiRequestWithToken } from './api';

async function createSession(token, sessionData) {
  return apiRequestWithToken('/sessions', token, {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
}

async function getMyStudentSessions(token) {
  return apiRequestWithToken('/sessions/my', token);
}

async function cancelSession(token, sessionId) {
  return apiRequestWithToken(`/sessions/${sessionId}/cancel`, token, {
    method: 'PUT',
  });
}

async function getCoachSessionRequests(token) {
  return apiRequestWithToken('/sessions/requests', token);
}

async function acceptSession(token, sessionId) {
  return apiRequestWithToken(`/sessions/${sessionId}/accept`, token, {
    method: 'PUT',
  });
}

async function rejectSession(token, sessionId) {
  return apiRequestWithToken(`/sessions/${sessionId}/reject`, token, {
    method: 'PUT',
  });
}

async function getSessionById(token, sessionId) {
  return apiRequestWithToken(`/sessions/${sessionId}`, token);
}

async function completeSession(token, sessionId, coachRemarks) {
  return apiRequestWithToken(`/sessions/${sessionId}/complete`, token, {
    method: 'PUT',
    body: JSON.stringify({ coach_remarks: coachRemarks || null }),
  });
}

export {
  createSession,
  getMyStudentSessions,
  getSessionById,
  cancelSession,
  getCoachSessionRequests,
  acceptSession,
  rejectSession,
  completeSession,
};

