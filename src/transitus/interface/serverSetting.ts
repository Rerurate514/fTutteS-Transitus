import { TransitusServer } from '../logic/server';
import { Server } from 'http';

export interface ITransitusServer {
    restart(): void;
    stop(): void;
    getServer(): Server | undefined;
}

export interface ServerSetting { 
    initialize(server: Server, tserver: TransitusServer): void;
    cleanup?(): void;
    name?: string;
}
