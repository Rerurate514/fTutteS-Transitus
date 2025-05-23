import { TransitusServer } from './server';

function runTransitusServer(){
    const server = new TransitusServer("index.html");
    server.run();
}

runTransitusServer();
