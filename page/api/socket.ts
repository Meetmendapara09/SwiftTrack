import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer, Socket } from 'socket.io';

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function socketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new IOServer(res.socket.server, {
      path: '/api/socket_io', // Custom path for Socket.IO
      addTrailingSlash: false, // Important for custom path
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    res.socket.server.io = io;

    io.on('connection', (socket: Socket) => {
      console.log('A client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

      // Relay messages
      // socket.on('client_message', (msg) => {
      //   console.log('Message from client ' + socket.id + ': ' + msg);
      //   io.emit('server_message', `Server received from ${socket.id}: ${msg}`);
      // });
    });
  }
  res.end();
}
