import client from './client'

export const listProjects = () =>
  client.get('/projects/')

export const createProject = (name, description) =>
  client.post('/projects/', { name, description })

export const getProject = (id) =>
  client.get(`/projects/${id}`)

export const deleteProject = (id) =>
  client.delete(`/projects/${id}`)

export const getDashboard = () =>
  client.get('/dashboard')

export const listMembers = (projectId) =>
  client.get(`/projects/${projectId}/members`)

export const addMember = (projectId, email, role = 'member') =>
  client.post(`/projects/${projectId}/members`, { email, role })

export const removeMember = (projectId, userId) =>
  client.delete(`/projects/${projectId}/members/${userId}`)
