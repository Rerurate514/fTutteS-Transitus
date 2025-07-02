import { ITransitusServer, ServerSetting } from "../../interface/serverSetting";
import { Server } from "http";
import * as fs from 'fs';
import * as path from 'path';
import { ChildProcess, spawn } from 'child_process';

export class HotReload implements ServerSetting {
    public readonly name = '🔥 HotReload';
    
    private watchers: fs.FSWatcher[] = [];
    private reloadTimeout?: NodeJS.Timeout;
    private transitusServer?: ITransitusServer;
    private devProcess?: ChildProcess;
    private isReloading = false;

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
        this.transitusServer = transitusServer;

        if(!this.config.enabled) return;

        this.startWatching();
    }

    private startWatching(): void {
        this.config.watchPaths.forEach((watchPath) => {
            if(fs.existsSync(watchPath)) {
                const watcher = fs.watch(watchPath, { recursive: true }, (_, fileName) => {
                    if(fileName && this.shouldReload(fileName)) this.scheduleReload();
                });
                this.watchers.push(watcher);
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
        if (this.isReloading) {
            console.log("🔥 Reload already in progress, skipping...");
            return;
        }

        if(this.reloadTimeout) clearTimeout(this.reloadTimeout);

        this.reloadTimeout = setTimeout(() => {
            this.triggerReload();
        }, this.config.debounceMs);
    }

    private async stopDevProcess(): Promise<void> {
        if (!this.devProcess) return;

        return new Promise((resolve) => {
            if (!this.devProcess) {
                resolve();
                return;
            }

            const timeout = setTimeout(() => {
                if (this.devProcess && !this.devProcess.killed) {
                    console.log("🔥 Force killing dev process...");
                    this.devProcess.kill('SIGKILL');
                }
                resolve();
            }, 5000);

            this.devProcess.on('exit', () => {
                clearTimeout(timeout);
                console.log("🔥 Dev process stopped");
                this.devProcess = undefined;
                resolve();
            });

            console.log("🔥 Stopping dev process...");
            this.devProcess.kill('SIGTERM');
        });
    }

    private async triggerReload(): Promise<void> {
        if (this.isReloading) {
            console.log("🔥 Reload already in progress, aborting...");
            return;
        }

        this.isReloading = true;

        try {
            console.log("🔥 Hot reload triggered - recompiling...");
            
            await this.recompileProject();
            
            if (this.transitusServer) {
                this.transitusServer.restart();
                console.log("🔥 Hot reload completed - server restarted");
            } else {
                console.warn("🔥 TransitusServer instance not available for restart");
            }
        } catch (error) {
            console.error("🔥 Error during hot reload:", error);
        } finally {
            this.isReloading = false;
        }
    }

    private async recompileProject(): Promise<void> {
        return new Promise((resolve, reject) => {
            const isWindows = process.platform === 'win32';
            const spawnOptions = {
                stdio: 'pipe' as const,
                ...(isWindows && { shell: true })
            };

            const buildProcess = isWindows ? 
                spawn('npm run build', [], spawnOptions) :
                spawn('npm', ['run', 'build'], spawnOptions);

            let output = '';
            let errorOutput = '';

            buildProcess.stdout?.on('data', (data) => {
                output += data.toString();
            });

            buildProcess.stderr?.on('data', (data) => {
                errorOutput += data.toString();
            });

            buildProcess.on('close', (code) => {
                if (code === 0) {
                    console.log("🔥 Project recompiled successfully");
                    resolve();
                } else {
                    console.error("🔥 Compilation failed:", errorOutput);
                    reject(new Error(`Build failed with code ${code}`));
                }
            });

            buildProcess.on('error', (error) => {
                console.error("🔥 Build process error:", error);
                reject(error);
            });
        });
    }

    cleanup(): void {
        if(this.reloadTimeout) clearTimeout(this.reloadTimeout);

        this.stopDevProcess();

        this.watchers.forEach(watcher => {
            try{
                watcher.close();
            } catch(e) {
                console.warn('🔥 Warning: Error closing file watcher:', e);
            }
        });

        this.watchers = [];

        console.log("🔥 Hot reload cleanup completed")
    }

    public getStatus(): {
        enabled: boolean;
        watchingPaths: string[];
        activeWatchers: number;
        devProcessRunning: boolean;
        isReloading: boolean;
    } {
        return {
            enabled: this.config.enabled,
            watchingPaths: this.config.watchPaths.filter(p => fs.existsSync(p)),
            activeWatchers: this.watchers.length,
            devProcessRunning: !!this.devProcess && !this.devProcess.killed,
            isReloading: this.isReloading
        };
    }
}
