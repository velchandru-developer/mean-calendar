const socketio = require('socket.io');

const tokenLib = require("./tokenLib.js");

const redisLib = require("./redisLib.js");


let setServer = (server) => {

    let io = socketio.listen(server);
    let myIo = io.of('/')
    
    myIo.on('connection', (socket) => {

        socket.emit("verifyUser", "Hello User");

        // code to verify the user and make him online

        socket.on('set-user', (authToken) => {

            tokenLib.verifyClaimWithoutSecret(authToken, (err, user) => {
                if (err) {
                    socket.emit('auth-error', { status: 500, error: 'Please provide correct auth token' })
                }
                else {

                    let currentUser = user.data;
                    // setting socket user id 
                    socket.userId = currentUser.userId
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
                    let key = currentUser.userId
                    let value = fullName

                    let setUserOnline = redisLib.setANewOnlineUserInHash("onlineUsers", key, value, (err, result) => {
                        if (err) {
                            console.log(`some error occurred`)
                        } else {
                            // getting online users list.

                            redisLib.getAllUsersInAHash('onlineUsers', (err, result) => {
                                if (err) {
                                    console.log(err)
                                } else {

                                    console.log(`${fullName} is online`);
                                    
 
                                    socket.broadcast.emit('online-user-list', result);
                                }
                            })
                        }
                    })

                }
            })

        });


        socket.on('disconnect', () => {
            // disconnect the user from socket

            console.log("user is disconnected");

            if (socket.userId) {
                redisLib.deleteUserFromHash('onlineUsers', socket.userId)
                redisLib.getAllUsersInAHash('onlineUsers', (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        socket.broadcast.emit('online-user-list', result);
                    }
                })
            }

        }) 


        socket.on('notify-updates', (data) => {
            socket.broadcast.emit(data.userId, data);
        });

    });
}

module.exports = {
    setServer: setServer
}
