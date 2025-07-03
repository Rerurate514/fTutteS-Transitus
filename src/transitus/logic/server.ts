import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { hostname, port } from "./setConfig";
import { MiddleWare } from "../interface/middleware";
import { ServerSetting } from "../interface/serverSetting";

interface TransitusServerOptions {
    middleWares: MiddleWare[],
    settings: ServerSetting[]
}

/**
 * TransitusServer クラス
 * ## OverView
 * fTutteSフレームワークで構築されたシングルページアプリケーション（SPA）のために設計されたシンプルなHTTPサーバーです。
 * このサーバーは、ファイルシステムから静的ファイルを提供するとともに、SPAのルーティング要件に対応するために、
 * 特定のリクエストに対して常に指定されたHTMLファイルを返します。
 * これにより、クライアントサイドのルーティングが適切に機能するようサポートします。
 *
 * ## Constructor
 * @param config TransitusServerOptionsインターフェースが入ります。その変数は以下の二つです。
 * @param middleWares Middlewareインターフェースを継承したクラスでsequenceに登録された動作を順次実行します。
 * @param settings ServerSettingインターフェースを継承したクラスでサーバーの設定を行います。
 *
 * ## Methods
 * ### run()
 * HTTPサーバーを起動し、指定されたホスト名とポートでリクエストのリッスンを開始します。
 * サーバーが正常に起動すると、コンソールにメッセージが出力されます。
 * 
 * ### stop()
 * サーバーを停止し、すべての設定のクリーンアップを実行します。
 */
export class TransitusServer {
    private server?: Server;

    constructor(protected options: TransitusServerOptions) {}

    public run(): void {
        this.server = createServer(
            (request: IncomingMessage, response: ServerResponse) => {
                try {
                    this.options.middleWares.forEach((middleware: MiddleWare) => {
                        if (!response.destroyed && !response.headersSent) {
                            middleware.sequence(request, response);
                        }
                    });
                } catch (error) {
                    console.error("⚙️ Middleware error:", error);
                    if (!response.headersSent) {
                        response.statusCode = 500;
                        response.end("⚙️ Internal Server Error");
                    }
                }
            }
        );

        this.initializeSettings();

        this.server.listen(port, hostname, () => {
            console.log(`⚙️  Server running at http://${hostname}:${port}/`);
        });

        this.server.on("error", (error) => {
            console.error("⚙️ Server error:", error);
        });

        this.setupGracefulShutdown();
    }

    private initializeSettings(): void {
        this.options.settings.forEach((setting: ServerSetting) => {
            try {
                setting.initialize(this.server!, this);
                if (setting.name) {
                    console.log(`✅ ${setting.name} setting initialized`);
                }
            } catch (error) {
                console.error(`⚙️  Error initializing setting ${setting.name || "unknown"}:`, error);
            }
        });
    }

    private setupGracefulShutdown(): void {
        const shutdown = () => {
            console.log("\n ⚙️ Shutting down server...");
            this.stop();
        };

        process.on("⚙️ SIGINT", shutdown);
        process.on("⚙️ SIGTERM", shutdown);
    }

    public stop(): void {
        if (this.server) {
            this.server.close((error) => {
                if (error) {
                    console.error("⚙️ Error closing server:", error);
                } else {
                    console.log("⚙️ Server stopped");
                }
            });
        }

        this.cleanupSettings();
    }

    private cleanupSettings(): void {
        this.options.settings.forEach((setting: ServerSetting) => {
            try {
                if (setting.cleanup) {
                    setting.cleanup();
                }
            } catch (error) {
                console.error(`⚙️  Error cleaning up setting ${setting.name || "unknown"}:`, error);
            }
        });
    }

    public restart(): void {
        console.log("⚙️  Restarting server...");
        
        if (this.server) {
            this.server.close(() => {
                setTimeout(() => {
                    this.run();
                }, 100);
            });
        } else {
            this.run();
        }

        console.log("⚙️  Server restarted");
    }

    public getServer(): Server | undefined {
        return this.server;
    }
}
