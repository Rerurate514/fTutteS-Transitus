import { IncomingMessage, ServerResponse } from 'http';

export interface MiddleWare { 
    sequence(request: IncomingMessage, response: ServerResponse): void;
}
