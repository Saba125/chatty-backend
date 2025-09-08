import { IFollowers } from '@follower/interfaces/followers.interface';
import { Server, Socket } from 'socket.io';
export let socketIOFollowerObject: Server;
export class SocketIoFollowerHandler {
  private io: Server;
  constructor(io: Server) {
    this.io = io;
    socketIOFollowerObject = io;
  }
  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('unfollow', (data: IFollowers) => {
        this.io.emit('remove follower', data);
      });
    });
  }
}
