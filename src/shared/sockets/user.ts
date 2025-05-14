import { IFollowers } from '@follower/interfaces/followers.interface';
import { Server, Socket } from 'socket.io';
export let socketIOUserObject: Server;
export class SocketIoUserHandler {
  private io: Server;
  constructor(io: Server) {
    this.io = io;
    socketIOUserObject = io;
  }
  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('block user', (data: IFollowers) => {
        this.io.emit('block user', data);
      });
      socket.on('unblock user', (data: IFollowers) => {
        this.io.emit('unblock  user id', data);
      });
    });
  }
}
