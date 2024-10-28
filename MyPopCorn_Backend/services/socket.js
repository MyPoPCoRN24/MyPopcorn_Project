const socketio = require("socket.io");
const Notification = require('../models/notification')
const SiteSettings = require('../models/sitesettings')
const User = require("../models/user");

const {
    addUser,
    getSocketId,
    removeUser,
    updateLastSeen,
    getLastSeen,
} = require("./socketFunction");

let io = null;

const startSocket = (app) => {
    io = socketio(app, { pingInterval: 60000, pingTimeout: 25000 });

    io.use((socket, next) => {
        let userId = socket.handshake.query.userId;

        if (userId) {
            socket.userId = userId;
            return next();
        } else {
            socket.disconnect("unauthorized");
            next(new Error("Unauthorized"));
        }
    });

    io.use(async (socket, next) => {
        await addUser({ userId: socket.userId, id: socket.id }, "USER");
        await updateLastSeen(socket.userId, 1);
        next();
    });

    io.on("connection", async function (socket, next) {
        // console.log("======user service connnect5ion========")
        try {
            let notific = await Notification.find({ user_id: socket.userId, read: false });
            if (notific) {
                io.sockets.to(socket.id).emit("new_notification", notific);
            }

            let site_maintenance = await SiteSettings.findOne({ key: 'site_maintenance' });
            if (site_maintenance) {
                io.sockets.to(socket.id).emit("site_maintenance", site_maintenance);
            }
            let Action = await User.findOne({ user_id: socket.userId, Action: false });
            if (Action) {
                io.sockets.to(socket.id).emit("Action", Action);
            }

            socket.on("disconnect", async () => {
                try {
                    console.log("==============socket disconnected=======", socket.userId, socket.id, "USER")
                    await removeUser(socket.userId, socket.id, "USER");
                    await updateLastSeen(socket.userId, 0);
                } catch (err) {
                    // console.log(err);
                }
            });
        } catch (error) {
            console.log(error.message);
        }
    });
};

const getSocket = () => io;



module.exports = {
    startSocket,
    getSocket
};