import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const setSocketInstance = (io: SocketIOServer): void => {
  ioInstance = io;
};

export const getSocketInstance = (): SocketIOServer | null => {
  return ioInstance;
};

export const emitEvent = (eventName: string, payload: any): void => {
  if (ioInstance) {
    ioInstance.emit(eventName, payload);
  }
};
