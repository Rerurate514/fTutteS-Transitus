import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import { hostname, port } from "./setConfig";
import { MiddleWare } from "@transitus/interface/middleware";

/**
 * TransitusServer クラス
 * ## OverView
 * fTutteSフレームワークで構築されたシングルページアプリケーション（SPA）のために設計されたシンプルなHTTPサーバーです。
 * このサーバーは、ファイルシステムから静的ファイルを提供するとともに、SPAのルーティング要件に対応するために、
 * 特定のリクエストに対して常に指定されたHTMLファイルを返します。
 * これにより、クライアントサイドのルーティングが適切に機能するようサポートします。
 *
 * ## Constructor
 * @param middlewares Middlewareインターフェースを継承したクラスでsequenceに登録された動作を順次実行します。
 *
 * ## Methods
 * ### run()
 * HTTPサーバーを起動し、指定されたホスト名とポートでリクエストのリッスンを開始します。
 * サーバーが正常に起動すると、コンソールにメッセージが出力されます。
 */
export class TransitusServer {
    constructor(
        protected middlewares: MiddleWare[] = []
    ){}

    public run() {
        const server: Server = createServer(
            (request: IncomingMessage, response: ServerResponse) => {
                this.middlewares.forEach((middleware: MiddleWare) => {
                    middleware.sequence(request, response);
                });
            }
        );

        server.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    }
}
