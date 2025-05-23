
import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import * as fs from "fs";
import path from "path";
import { hostname, port } from "./setConfig";

/**
 * TransitusServer クラス
 * ## OverView
 * fTutteSフレームワークで構築されたシングルページアプリケーション（SPA）のために設計されたシンプルなHTTPサーバーです。
 * このサーバーは、ファイルシステムから静的ファイルを提供するとともに、SPAのルーティング要件に対応するために、
 * 特定のリクエストに対して常に指定されたHTMLファイルを返します。
 * これにより、クライアントサイドのルーティングが適切に機能するようサポートします。
 *
 * ## Constructor
 * @param htmlFilePath アプリケーションの単一のエントリーポイントとなるHTMLファイルのパス（例: `index.html`）
 *
 * ## Methods
 * ### run()
 * HTTPサーバーを起動し、指定されたホスト名とポートでリクエストのリッスンを開始します。
 * サーバーが正常に起動すると、コンソールにメッセージが出力されます。
 */
export class TransitusServer {
    constructor(protected htmlFilePath: string){}

    public run() {
        const server: Server = createServer(
            (request: IncomingMessage, response: ServerResponse) => {
                this.requestHandler(request, response);
            }
        );

        server.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    }

    private requestHandler(request: IncomingMessage, response: ServerResponse) {
        //const view = this.routes.get(request.url ?? "");
        const url = request.url || "/";
        const filePath = this.getFilePath(url);
        const contentType = this.getContentType(filePath);

        if(fs.existsSync(filePath) && !this.isHtmlRoute(url)) {
            fs.readFile(filePath, (err, data) => {
                if(err) {
                    this.send404(response);
                } else {
                    response.statusCode = 200;
                    response.setHeader("Content-Type", contentType);
                    response.end(data);
                }
            })
        } else {
            fs.readFile(this.htmlFilePath, (err, data) => {
                if (err) {
                    response.statusCode = 500;
                    response.setHeader("Content-Type", "text/plain");
                    response.end("Internal Server Error\n" + err);
                } else {
                    response.statusCode = 200;
                    response.setHeader("Content-Type", contentType);
                    response.end(data);
                }
            });
        }
    }

    private getFilePath(url: string): string {
        if (url === "/") return this.htmlFilePath;
        
        return path.join(process.cwd(), url.substring(1));
    }

    private getContentType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };
        
        return mimeTypes[ext] || 'text/html';
    }

    private isHtmlRoute(url: string): boolean {
        const spaRoutes = ['/', '/about', '/contact'];
        return spaRoutes.includes(url) || (!path.extname(url) && !url.includes('.'));
    }

    private send404(response: ServerResponse) {
        response.statusCode = 404;
        response.setHeader("Content-Type", "text/plain");
        response.end("404 Not Found");
    }

}
