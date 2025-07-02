import { ITransitusServer, ServerSetting } from "@transitus/interface/serverSetting";
import * as fs from 'fs';
import { Server } from "http";
import * as path from 'path';
import { TransitusServer } from "../server";

export class HotReload implements ServerSetting {
    public readonly name = 'HotReload';
    
    private watchers: fs.FSWatcher[] = [];
    private reloadTimeout?: NodeJS.Timeout;
    private serverInstance?: Server;
    private transitusServer?: ITransitusServer;

    constructor(
        private config: {
            watchPaths: string[];
            excludePatterns: string[];
            debounceMs: number;
            enabled: boolean;
        } = {
            watchPaths: ['./src'],
            excludePatterns: ['node_modules', 'dist', '.git', '*.log'],
            debounceMs: 300,
            enabled: process.env.NODE_ENV === 'development'
        }
    ) {}
    
    initialize(server: Server, transitusServer: ITransitusServer): void {
        this.serverInstance = server;
        this.transitusServer = transitusServer;

        if(!this.config.enabled) return;

        this.startWatching();
    }

    private startWatching(): void {
        this.config.watchPaths.forEach((watchPath) => {
            if(fs.existsSync(watchPath)) {
                const watcher = fs.watch(watchPath, { recursive: true }, (_, fileName) => {
                    if(fileName && this.shouldReload(fileName)) this.scheduleReload();
                    this.watchers.push(watcher);
                });
            }
        });
    }

    private shouldReload(fileName: string): boolean {
        const reloadEx = [".ts", ".js", ".json"];
        const ext = path.extname(fileName);

        const shouldExclude = this.config.excludePatterns.some(pattern => 
            fileName.includes(pattern)
        );

        const isTempFile = fileName.startsWith('.') || fileName.includes('~') || fileName.includes('.tmp');
        
        return reloadEx.includes(ext) && !shouldExclude && !isTempFile;
    }

    private scheduleReload(): void {
        if(this.reloadTimeout) clearTimeout(this.reloadTimeout);

        this.reloadTimeout = setTimeout(() => {
            this.triggerReload();
        }, this.config.debounceMs);
    }

    private triggerReload(): void {
        this.clearModuleCache();

        if (this.transitusServer) this.transitusServer.restart();        
        else console.warn("TransitusServer instance not available for restart");
    }

    private clearModuleCache(): void {
        Object.keys(require.cache).forEach(key => {
            if(!key.includes("node_modules")) {
                delete require.cache[key];
            }
        });
    }

    cleanup(): void {
        if(this.reloadTimeout) clearTimeout(this.reloadTimeout);

        this.watchers.forEach(watcher => {
            try{
                watcher.close;
            } catch(e) {
                console.warn('Warning: Error closing file watcher:', e);
            }
        });

        this.watchers = [];

        console.log("Hot reload cleanup completed")
    }

    public getStatus(): {
        enabled: boolean;
        watchingPaths: string[];
        activeWatchers: number;
    } {
        return {
            enabled: this.config.enabled,
            watchingPaths: this.config.watchPaths.filter(p => fs.existsSync(p)),
            activeWatchers: this.watchers.length
        };
    }
}
