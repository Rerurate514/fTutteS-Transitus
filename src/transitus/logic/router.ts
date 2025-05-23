import { pathProvider } from "../components/appRouter";

export class Router {
    private routesHistory: string[] = [];

    constructor(protected homePath: string){}

    public push(path: string){
        this.routesHistory.push(path);
        this.route();
    }

    public pop(){
        this.routesHistory.pop();
        this.route();
    }

    private route(){
        
        if(this.routesHistory.length === 0) {
            window.history.pushState({}, "", this.homePath);
            pathProvider.update(() => this.homePath);
        } else {
            const path = this.routesHistory.at(-1);

            window.history.pushState({}, "", path)
            pathProvider.update(() => path ?? this.homePath);
        }
    }
}
