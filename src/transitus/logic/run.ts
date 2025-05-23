import { TransitusServer } from './server';

/**
 * runTransitusServer
 * ## OverView
 * fTutteSアプリケーションのためにTransitusServerを初期化し、起動する関数です。
 * `index.html`をアプリケーションの単一のエントリーポイントとして設定し、
 * サーバーをローカルホストのポート3001でリッスン状態にします。
 *
 * ## Usage
 * この関数を呼び出すことで、開発環境や本番環境でサーブするための軽量なHTTPサーバーが起動します。
 * ```
 */
function runTransitusServer(){
    const server = new TransitusServer("index.html");
    server.run();
}

runTransitusServer();
