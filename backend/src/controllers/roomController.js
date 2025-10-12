const Room = require("../models/Room");


exports.getRoom = async (req, res) => {
    const { roomId } = req.body;
    try {
        const room = await Room.findOne({ roomId });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json({"success":true, room});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createRoom = async (req, res) => {
    const { roomId } = req.body;

    if(await Room.findOne({ roomId })) {
        return res.status(400).json({ message: 'Room ID already exists' });
    }
    const userId = (req.user?.id || req.user?._id); 
    const room = await Room.create({ roomId , createdBy: userId , users: [userId] , files: [] });
    if(!room) {
        return res.status(500).json({ message: 'Error creating room' });
    }

    res.status(201).json({"success":true, "room": room});
};