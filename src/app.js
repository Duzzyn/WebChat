import express from 'express';
import {createServer} from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Server } from "socket.io";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database
})

await db.exec(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_offset TEXT UNIQUE,
    username TEXT,
    content TEXT
)`);

const app = express();
const server = createServer(app)
const io = new Server(server, {
    connectionStateRecovery: {}
})   


const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(__dirname, '../')))

io.on('connection', async (socket) => {
    console.log('a user connected');
    socket.on('chat message', async (msg) => {
        let result;
        try {
            result = await db.run('INSERT INTO messages (username, content) VALUES (?, ?)', msg.username, msg.msg);
        } catch (err) {
            return
        }
        io.emit('chat message', msg, result.lastID);
    });

    if(!socket.recovered) {
        try {
            await db.each('SELECT id, username, content FROM messages WHERE id > ?',
                [socket.handshake.auth.serverOffset || 0],
                (err, row) => {
                    socket.emit('chat message', { username: row.username, msg: row.content }, row.id)
                }
            )
        } catch (e) {
            console.error(e)
        }
    }

    socket.on('disconnect', () => {
        console.log('user disconnected');
    })         
});

server.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000")
});