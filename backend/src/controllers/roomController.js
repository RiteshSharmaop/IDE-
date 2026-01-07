const Room = require("../models/Room");
const UserRoom = require("../models/UserRoom");
const FolderStructure = require("../models/FolderStructure");
const File = require("../models/File");

// @desc    Get all user rooms
// @route   GET /api/rooms/user-rooms
// @access  Private
exports.getUserRooms = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const userRooms = await UserRoom.find({ userId })
      .populate("files")
      .populate("collaborators", "username email")
      .sort({ lastAccessed: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: userRooms.length,
      data: userRooms,
    });
  } catch (error) {
    console.error("Get user rooms error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user rooms",
      error: error.message,
    });
  }
};

// @desc    Create user room
// @route   POST /api/rooms/create-user-room
// @access  Private
exports.createUserRoom = async (req, res) => {
  try {
    const { roomId, roomName, description } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!roomId || !roomName) {
      return res.status(400).json({
        success: false,
        message: "Room ID and name are required",
      });
    }

    // Check if room already exists for this user
    const existingRoom = await UserRoom.findOne({ userId, roomId });
    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: "Room already exists for this user",
      });
    }

    // Create root folder structure
    const rootFolder = await FolderStructure.create({
      userId,
      roomId,
      name: "root",
      type: "folder",
      path: "root",
      parentId: null,
      isExpanded: true,
    });

    // Create user room
    const userRoom = await UserRoom.create({
      userId,
      roomId,
      roomName,
      description,
      folderStructure: rootFolder._id,
      files: [],
      collaborators: [userId],
    });

    res.status(201).json({
      success: true,
      message: "User room created successfully",
      data: userRoom,
    });
  } catch (error) {
    console.error("Create user room error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user room",
      error: error.message,
    });
  }
};

// @desc    Get room with folder structure
// @route   GET /api/rooms/:roomId/structure
// @access  Private
exports.getRoomStructure = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const userRoom = await UserRoom.findOne({ userId, roomId })
      .populate("folderStructure")
      .populate("files");

    if (!userRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Get folder structure hierarchy
    const folderStructure = await FolderStructure.findById(
      userRoom.folderStructure
    ).populate({
      path: "children",
      populate: { path: "children fileId" },
    });

    res.status(200).json({
      success: true,
      data: {
        userRoom,
        folderStructure,
      },
    });
  } catch (error) {
    console.error("Get room structure error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching room structure",
      error: error.message,
    });
  }
};

// @desc    Save folder structure
// @route   POST /api/rooms/:roomId/save-structure
// @access  Private
exports.saveFolderStructure = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { folders, files } = req.body;
    const userId = req.user?.id || req.user?._id;

    const userRoom = await UserRoom.findOne({ userId, roomId });
    if (!userRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Clear existing folder structure except root
    await FolderStructure.deleteMany({
      userId,
      roomId,
      type: "folder",
      name: { $ne: "root" },
    });

    // Create new folder structure
    const folderMap = new Map();

    for (const folder of folders) {
      const newFolder = await FolderStructure.create({
        userId,
        roomId,
        name: folder.name,
        type: "folder",
        path: folder.path,
        parentId: folder.parentId || null,
        isExpanded: folder.isExpanded !== false,
      });
      folderMap.set(folder.path, newFolder._id);
    }

    // Update parent-child relationships
    for (const folder of folders) {
      if (folder.parentId) {
        await FolderStructure.findByIdAndUpdate(folder.parentId, {
          $push: { children: folderMap.get(folder.path) },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Folder structure saved successfully",
      data: { folderMap },
    });
  } catch (error) {
    console.error("Save folder structure error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving folder structure",
      error: error.message,
    });
  }
};

// @desc    Update last accessed time
// @route   PUT /api/rooms/:roomId/last-accessed
// @access  Private
exports.updateLastAccessed = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const userRoom = await UserRoom.findOneAndUpdate(
      { userId, roomId },
      { lastAccessed: new Date() },
      { new: true }
    );

    if (!userRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: userRoom,
    });
  } catch (error) {
    console.error("Update last accessed error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating room",
      error: error.message,
    });
  }
};

// @desc    Delete user room
// @route   DELETE /api/rooms/:roomId
// @access  Private
exports.deleteUserRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const userRoom = await UserRoom.findOneAndDelete({ userId, roomId });
    if (!userRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Delete associated folder structure
    await FolderStructure.deleteMany({ userId, roomId });

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting room",
      error: error.message,
    });
  }
};

// Legacy endpoints for backward compatibility
exports.getRoom = async (req, res) => {
  const { roomId } = req.body;
  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json({ success: true, room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createRoom = async (req, res) => {
  const { roomId } = req.body;

  if (await Room.findOne({ roomId })) {
    return res.status(400).json({ message: "Room ID already exists" });
  }
  const userId = req.user?.id || req.user?._id;
  const room = await Room.create({
    roomId,
    createdBy: userId,
    users: [userId],
    files: [],
  });
  if (!room) {
    return res.status(500).json({ message: "Error creating room" });
  }

  res.status(201).json({ success: true, room: room });
};
