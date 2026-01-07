// lib/roomApi.js
import { apiClient } from "./api";

// Get all user rooms
export const getUserRooms = async () => {
  try {
    const response = await apiClient.get("/rooms/user-rooms");
    return response.data;
  } catch (error) {
    console.error("Error fetching user rooms:", error);
    throw error;
  }
};

// Create new user room
export const createUserRoom = async (roomData) => {
  try {
    const response = await apiClient.post("/rooms/create-user-room", roomData);
    return response.data;
  } catch (error) {
    console.error("Error creating user room:", error);
    throw error;
  }
};

// Get room with structure
export const getRoomStructure = async (roomId) => {
  try {
    const response = await apiClient.get(`/rooms/${roomId}/structure`);
    return response.data;
  } catch (error) {
    console.error("Error fetching room structure:", error);
    throw error;
  }
};

// Save folder structure
export const saveFolderStructure = async (roomId, folderData) => {
  try {
    const response = await apiClient.post(
      `/rooms/${roomId}/save-structure`,
      folderData
    );
    return response.data;
  } catch (error) {
    console.error("Error saving folder structure:", error);
    throw error;
  }
};

// Update last accessed time
export const updateLastAccessed = async (roomId) => {
  try {
    const response = await apiClient.put(`/rooms/${roomId}/last-accessed`);
    return response.data;
  } catch (error) {
    console.error("Error updating last accessed:", error);
    throw error;
  }
};

// Delete user room
export const deleteUserRoom = async (roomId) => {
  try {
    const response = await apiClient.delete(`/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user room:", error);
    throw error;
  }
};

// Save file to room
export const saveFileToRoom = async (fileId, roomId) => {
  try {
    const response = await apiClient.post(
      `/files/${fileId}/save-to-room/${roomId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error saving file to room:", error);
    throw error;
  }
};

// Get room files
export const getRoomFiles = async (roomId) => {
  try {
    const response = await apiClient.get(`/files/room/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching room files:", error);
    throw error;
  }
};
