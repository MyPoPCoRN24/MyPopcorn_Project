const { getSocketId } = require("./socketFunction");
const { getSocket } = require("./socket");

const sendData = async (key, userId, data) => {
  const redisData = await getSocketId(userId, "USER");
  if (redisData) {
    const io = await getSocket();
    redisData.id.forEach((item) => {
      io.sockets.to(item).emit(key, data);
    });
  }
};

module.exports = {
  sendData,
};