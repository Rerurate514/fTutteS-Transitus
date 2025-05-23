export let hostname = "127.0.0.1";
export let port = 3000;

export function setHost(hostNameArg: string){
    hostname = hostNameArg;
}

export function setPort(portArg: number){
    port = portArg;
}
