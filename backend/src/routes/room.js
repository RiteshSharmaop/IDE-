const {
  getRoom,
  createRoom,
  getUserRooms,
  createUserRoom,
  getRoomStructure,
  saveFolderStructure,
  updateLastAccessed,
  deleteUserRoom,
} = require("../controllers/roomController");
const { protect } = require("../middleware/auth");

const router = require("express").Router();

// Legacy routes
router.get("/", getRoom);
router.post("/create", createRoom);

// New user room routes
router.get("/user-rooms", protect, getUserRooms);
router.post("/create-user-room", protect, createUserRoom);
router.get("/:roomId/structure", protect, getRoomStructure);
router.post("/:roomId/save-structure", protect, saveFolderStructure);
router.put("/:roomId/last-accessed", protect, updateLastAccessed);
router.delete("/:roomId", protect, deleteUserRoom);

exports.roomRouter = router;
