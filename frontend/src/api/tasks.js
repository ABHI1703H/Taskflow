import client from './client'

export const listTasks = (projectId) =>
  client.get(`/projects/${projectId}/tasks`)

export const createTask = (projectId, data) =>
  client.post(`/projects/${projectId}/tasks`, data)

export const updateTask = (projectId, taskId, data) =>
  client.patch(`/projects/${projectId}/tasks/${taskId}`, data)

export const deleteTask = (projectId, taskId) =>
  client.delete(`/projects/${projectId}/tasks/${taskId}`)
