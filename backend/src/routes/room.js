const { getRoom, createRoom } = require('../controllers/roomController');

const router = require('express').Router();


router.get('/' , getRoom);
router.post('/create' , createRoom);

exports.roomRouter = router;