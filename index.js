const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');
var EventEmitter = require('events')

const myEmitter = new EventEmitter();

const program = async() => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'ultraman',
    });

    const instance = new MySQLEvents(connection, {
        startAtEnd: true,
        excludedSchemas: {
            mysql: true,
        },
    });

    // await instance.start();

    // instance.addTrigger({
    //     name: 'EMITTER-TRIGGER',
    //     expression: '*',
    //     statement: MySQLEvents.STATEMENTS.ALL,
    //     onEvent: (event) => { // You will receive the events here
    //         console.log(event);
    //         if (event.schema == "chat_db") {
    //             myEmitter.emit('ping', { data: event.affectedRows[0].after });
    //             return event;
    //         }
    //     },
    // });


    instance
        .start()
        .then(() => {
            console.log("Running MySQLEvents!");
            instance.addTrigger({
                name: "xyz",
                expression: "*",
                statement: MySQLEvents.STATEMENTS.ALL,
                onEvent: (event) => {
                    // Here you will get the events for the given expression/statement.
                    // This could be an async function.
                    console.log("event", event);
                },
            });
        })
        .catch((err) => console.error("Something bad happened MySQLEvents", err));


    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

program()
    .then((evt) => console.log('Waiting for database events...'))
    .catch(console.error);

io.on('connection', (socket) => {
    myEmitter.on('ping', function(data) {
        console.log(socket);
        socket.emit("get_transmission", { data: data });
    });
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});