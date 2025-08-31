import api from './api';

// API service functions for backend communication

// Stories
export const getStories = async (params = {}) => {
  const response = await api.get('/api/v1/stories', { params });
  return response.data;
};

export const getStoryById = async (id) => {
  const response = await api.get(`/api/v1/stories/${id}`);
  return response.data;
};

export const getStoryBySlug = async (slug) => {
  const response = await api.get(`/api/v1/stories/slug/${slug}`);
  return response.data;
};

export const createStory = async (storyData) => {
  const response = await api.post('/api/v1/stories', storyData);
  return response.data;
};

export const updateStory = async (id, storyData) => {
  const response = await api.put(`/api/v1/stories/${id}`, storyData);
  return response.data;
};

export const deleteStory = async (id) => {
  const response = await api.delete(`/api/v1/stories/${id}`);
  return response.data;
};

export const likeStory = async (id) => {
  const response = await api.post(`/api/v1/stories/${id}/like`);
  return response.data;
};

export const bookmarkStory = async (id, notes = '', tags = []) => {
  const response = await api.post(`/api/v1/stories/${id}/bookmark`, { notes, tags });
  return response.data;
};

export const getTrendingStories = async (limit = 10) => {
  const response = await api.get('/api/v1/stories/trending', { params: { limit } });
  return response.data;
};

export const getFeaturedStories = async (limit = 5) => {
  const response = await api.get('/api/v1/stories/featured', { params: { limit } });
  return response.data;
};

export const getStoriesByCategory = async (category, params = {}) => {
  const response = await api.get('/api/v1/stories/categories', { 
    params: { category, ...params } 
  });
  return response.data;
};

// Users
export const getUsers = async (params = {}) => {
  const response = await api.get('/api/v1/users', { params });
  return response.data;
};

export const searchUsers = async (query, limit = 10) => {
  const response = await api.get('/api/v1/users/search', { 
    params: { q: query, limit } 
  });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/api/v1/users/${id}`);
  return response.data;
};

export const getUserByUsername = async (username) => {
  const response = await api.get(`/api/v1/users/username/${username}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/api/v1/users/${id}`, userData);
  return response.data;
};

export const followUser = async (id) => {
  const response = await api.post(`/api/v1/users/${id}/follow`);
  return response.data;
};

export const getUserStats = async (id) => {
  const response = await api.get(`/api/v1/users/${id}/stats`);
  return response.data;
};

// Chats
export const getChats = async (params = {}) => {
  const response = await api.get('/api/v1/chats', { params });
  return response.data;
};

export const createChat = async (chatData) => {
  const response = await api.post('/api/v1/chats', chatData);
  return response.data;
};

export const getChatById = async (chatId) => {
  const response = await api.get(`/api/v1/chats/${chatId}`);
  return response.data;
};

export const updateChat = async (chatId, chatData) => {
  const response = await api.put(`/api/v1/chats/${chatId}`, chatData);
  return response.data;
};

export const deleteChat = async (chatId) => {
  const response = await api.delete(`/api/v1/chats/${chatId}`);
  return response.data;
};

export const getChatMessages = async (chatId, params = {}) => {
  const response = await api.get(`/api/v1/chats/${chatId}/messages`, { params });
  return response.data;
};

export const sendMessage = async (chatId, messageData) => {
  const response = await api.post(`/api/v1/chats/${chatId}/messages`, messageData);
  return response.data;
};

export const addParticipant = async (chatId, userId, role = 'member') => {
  const response = await api.post(`/api/v1/chats/${chatId}/participants`, { userId, role });
  return response.data;
};

export const removeParticipant = async (chatId, userId) => {
  const response = await api.delete(`/api/v1/chats/${chatId}/participants/${userId}`);
  return response.data;
};

// Categories
export const getCategories = async () => {
  const response = await api.get('/api/v1/categories');
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/api/v1/categories/${id}`);
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await api.post('/api/v1/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/api/v1/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/api/v1/categories/${id}`);
  return response.data;
};

export const getTrendingCategories = async (limit = 5) => {
  const response = await api.get('/api/v1/categories/trending', { params: { limit } });
  return response.data;
};

// Comments
export const getStoryComments = async (storyId, params = {}) => {
  const response = await api.get(`/api/v1/stories/${storyId}/comments`, { params });
  return response.data;
};

export const addComment = async (storyId, commentData) => {
  const response = await api.post(`/api/v1/stories/${storyId}/comments`, commentData);
  return response.data;
};

export const getCommentById = async (id) => {
  const response = await api.get(`/api/v1/comments/${id}`);
  return response.data;
};

export const updateComment = async (id, commentData) => {
  const response = await api.put(`/api/v1/comments/${id}`, commentData);
  return response.data;
};

export const deleteComment = async (id) => {
  const response = await api.delete(`/api/v1/comments/${id}`);
  return response.data;
};

export const likeComment = async (id) => {
  const response = await api.post(`/api/v1/comments/${id}/like`);
  return response.data;
};
