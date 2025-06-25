import { MiddleWare } from '@transitus/interface/middleware';
import { IncomingMessage, ServerResponse } from 'http';
import * as fs from "fs";
import path from "path";

export class DefaultRequestHandler implements MiddleWare {
    constructor(protected htmlFilePath: string){}

    sequence(request: IncomingMessage, response: ServerResponse): void {
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
