# fTutteS-Transitus
![NPM Version](https://img.shields.io/npm/v/transitus)
![NPM Unpacked Size : mjs and js](https://img.shields.io/npm/unpacked-size/transitus)
![NPM Last Update](https://img.shields.io/npm/last-update/transitus)
![NPM Downloads](https://img.shields.io/npm/dw/transitus)
![NPM License](https://img.shields.io/npm/l/transitus)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/transitus)
![GitHub repo size](https://img.shields.io/github/repo-size/rerurate514/fTutteS-transitus)
![GitHub branch status](https://img.shields.io/github/checks-status/rerurate514/fTutteS-transitus/develop)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/rerurate514/fTutteS-transitus)
![GitHub last commit](https://img.shields.io/github/last-commit/rerurate514/fTutteS-transitus)
![X (formerly Twitter) URL](https://img.shields.io/twitter/url?url=https%3A%2F%2Fx.com%2Frerurate)

latest version -> transitus@0.2.0

## Installation
このライブラリは単体でのセットアップは推奨していません。
代わりに[tommand](https://github.com/Rerurate514/fTutteS-tommand)ライブラリによるセットアップが推奨されています。
```shell
npx tommand create-transitus-ftuttes プロジェクト名
```

## Usage
最初にTommandによってテンプレートプロジェクトが作成された後、以下のコマンドを実行します。
```shell
npm run dev
```

このコマンドを実行すると、nodeJsサーバーが起動します。
この時、`index.html`ファイルはプロジェクトルートに置かれていかなければなりません。

### Server Example
[tommand](https://github.com/Rerurate514/fTutteS-tommand)ライブラリでセットアップした場合、`run.ts`というファイルが`src/`にあるかと思います。
その中身は以下のようになります。
```typescript
import { TransitusServer, DefaultRequestHandler, HotReload } from "./middlewares/defaultRequestHandler";

process.env.NODE_ENV = "development";

const middlewares = [
    new DefaultRequestHandler("index.html"),
];

const settings = [
    new HotReload({
        watchPaths: ["./src", "./config", "./public"],
        excludePatterns: ["node_modules", "dist", ".git", "*.log", "*.tmp"],
        debounceMs: 500,
        enabled: process.env.NODE_ENV === "development"
    }),
];

const server = new TransitusServer(middlewares, settings);

server.run();
```

`Transitus`サーバーを起動するには`TransitusServer`クラスを作成して、`run`メソッドを実行します。
そして、`tommand`プロジェクトでデフォルトで規定された`npm run dev`を実行します。

`TransitusServer`クラスは二つの引数を持ちます。
- `middlewares`: `MiddleWare`クラスを継承したインスタンスの配列 
- `serverSetting`: `ServerSetting`クラスを継承したインスタンスの配列

#### MiddleWareクラス
`MiddleWare`クラスの実装は以下の通りです。
```typescript
import { IncomingMessage, ServerResponse } from 'http';

export interface MiddleWare { 
    sequence(request: IncomingMessage, response: ServerResponse): void;
}
```
基本的にミドルウェアは、リクエストとレスポンスの間でそれらを処理する中間処理を行います。
`transitus`では、`DefaultRequestHandler`というミドルウェアを提供しています。

##### DefaultRequestHandler
`DefaultRequestHandler`はミドルウェアの一種です。
このミドルウェアは、
- DefaultRequestHandlerクラスはMiddleWareインターフェースを実装
- HTTPリクエストとレスポンスの処理を担当
- HTMLファイルパスのコンストラクタ注入による設定

- URLパスの解析とファイルパス変換
- コンテンツタイプの自動判定
- HTMLルートと静的ファイルの区別処理
- ファイルハンドリング
- 静的ファイルの読み込みと提供
- HTMLルートへの適切なレスポンス
- エラーハンドリング（404, 500）
- コンテンツ管理
- 多様なファイル形式のサポート（HTML, JS, CSS, JSON, 画像など）
- MIMEタイプの自動設定
- SPAルーティング対応
などの基本的なNodeJSサーバーに必要な機能が含まれています。

#### ServerSettingクラス
`ServerSetting`クラスの実装は以下の通りです。
```typescript
import { TransitusServer } from '../logic/server';
import { Server } from 'http';

export interface ITransitusServer {
    restart(): void;
    stop(): void;
    getServer(): Server | undefined;
}

export interface ServerSetting { 
    initialize(server: Server, tserver: TransitusServer): void;
    cleanup?(): void;
    name?: string;
}
```

##### HotReload
`HotReload`はファイルの変更を検知した際に自動的にリビルドする機構を提供しています。
ただ、`WebSocket`を使用していないので、ブラウザ側は自身でリロードしなければなりません。
※ただし、`npm run dev`を実行してから、`index.html`をVSCode拡張機能のLiveServerで起動するといい感じです。。。

### Component Example
最初に`Router`クラスを作ります。
```typescript
const router = new Router("/");
```
コンストラクタには最初に表示されるホームパスを文字列で代入します。

次に`AppRouter`コンポーネントを使用します。
```typescript
const appRoutes = new Map<string, View>();
appRoutes.set("/", new HomePage());
appRoutes.set("/about", new AboutPage());
appRoutes.set("/contact", new ContactPage());

const appRouter = new AppRouter({
    routes: appRoutes,      // 定義したルートマップ
    page404: new NotFoundPage(), // 404ページ
    homePage: new HomePage(),    // ホームページ（パスが"/"の場合や、不正なパス形式の場合）
    startPageRoute: "/" // アプリケーション起動時の現在のパス
});
```
これを`assembleView`でアセンブルします。

ページの遷移には`Router`の`push`メソッドと`pop`メソッドを使用します。
引数にはパスを入れます。
```typescript
new ElevatedButton({
    onClick: () => {
        router.push("about");
    },
    child: new Text({
        text: "Go to the About page"
    })
});

new ElevatedButton({
    onClick: () => {
        router.pop();
    },
    child: new Text({
        text: "もどる"
    })
});
```

全体のコードを以下に記します。
```typescript
import {
    View,
    Text,
    Column,
    ElevatedButton,
    BaseCSS,
    TextCSS,
    FontCSS,
    assembleView,
    BorderCSS,
    ProviderObserver,
} from 'ftuttes';

import { AppRouter, Router } from 'transitus';

new ProviderObserver().outLogs(true);

const router = new Router("/");

// --- 各ページのView定義 ---

/**
 * ホームページ View
 */
class HomePage extends View {
    override build(): View {
        return new Column({
            baseCSS: new BaseCSS({
                margin: "20px",
                padding: "20px",
                background: "#e0ffe0",
                borderCSS: new BorderCSS({borderSize: "1px", borderProperty: "solid", color: "#a0ffa0", radius: "8px"})
            }),
            children: [
                new Text({
                    text: "✨ ホームページへようこそ！ ✨",
                    textCSS: new TextCSS({ fontCSS: new FontCSS({ fontSize: "30px", color: "green", fontWeight: "bold" }) })
                }),
                new Text({
                    text: "ここはアプリケーションの開始地点です。",
                    textCSS: new TextCSS({ fontCSS: new FontCSS({ fontSize: "16px", color: "#333" }) })
                }),
                new ElevatedButton({
                    child: new Text({
                        text: "アバウトページへ行く"
                    }),
                    onClick: () => {
                        router.push("/about");
                    }, // URLを変更してルーティング
                    baseCSS: new BaseCSS({ margin: "15px 0" })
                }),
                new ElevatedButton({
                    child: new Text({text: "お問い合わせページへ行く"},),
                    onClick: () => {
                        router.push("/contact");
                    }, // URLを変更してルーティング
                    baseCSS: new BaseCSS({ margin: "5px" })
                })
            ]
        });
    }
}

/**
 * アバウトページ View
 */
class AboutPage extends View {
    override build(): View {
        return new Column({
            baseCSS: new BaseCSS({
                margin: "20px",
                padding: "20px",
                background: "#e0e0ff",
                borderCSS: new BorderCSS({ borderSize: "1px", borderProperty: "solid", color: "#a0a0ff", radius: "8px" })
            }),
            children: [
                new Text({
                    text: "ℹ️ アバウトページ ℹ️",
                    textCSS: new TextCSS({ fontCSS: new FontCSS({ fontSize: "30px", color: "blue", fontWeight: "bold" }) })
                }),
                new Text({
                    text: "このアプリケーションについての情報です。",
                    textCSS: new TextCSS({ fontCSS: new FontCSS({ fontSize: "16px", color: "#333" }) })
                }),
                new ElevatedButton({
                    child: new Text({ text: "ホームへ戻る" }),
                    onClick: () => {
                        router.push("/");
                    }, // URLを変更してルーティング
                    baseCSS: new BaseCSS({ margin: "15px 0" })
                })
            ]
        });
    }
}

/**
 * お問い合わせページ View
 */
class ContactPage extends View {
    override build(): View {
        return new Column({
            baseCSS: new BaseCSS({
                margin: "20px",
                padding: "20px",
                background: "#ffffe0",
                borderCSS: new BorderCSS({ borderSize: "1px", borderProperty: "solid", color: "#ffffa0", radius: "8px" })
            }),
            children: [
                new Text({
                    text: "✉️ お問い合わせ ✉️",
                    textCSS: new TextCSS({ fontCSS: new FontCSS({ fontSize: "30px", color: "orange", fontWeight: "bold" }) })
                }),
                new Text({
                    text: "ご質問やご意見はこちらからどうぞ。",
                    textCSS: new TextCSS({ fontCSS: new FontCSS({ fontSize: "16px", color: "#333" }) })
                }),
                new ElevatedButton({
                    child: new Text({ text: "ホームへ戻る" }),
                    onClick: () => {
                        router.push("/");
                    }, // URLを変更してルーティング
                    baseCSS: new BaseCSS({ margin: "15px 0" })
                })
            ]
        });
    }
}

/**
 * 404 Not Found ページ View
 */
class NotFoundPage extends View {
    override build(): View {
        return new Column({
            baseCSS: new BaseCSS({
                margin: "20px",
                padding: "20px",
                background: "#ffe0e0",
                borderCSS: new BorderCSS({ borderSize: "1px", borderProperty: "solid", color: "#ffa0a0", radius: "8px" })
            }),
            children: [
                new Text({
                    text: "🚨 404 - ページが見つかりません 🚨",
                    textCSS: new TextCSS({ fontCSS: new FontCSS({ fontSize: "30px", color: "red", fontWeight: "bold" }) })
                }),
                new Text({
                    text: "お探しのページは見つかりませんでした。",
                    textCSS: new TextCSS({ fontCSS: new FontCSS({ fontSize: "16px", color: "#333" }) })
                }),
                new ElevatedButton({
                    child: new Text({ text: "ホームへ戻る" }),
                    onClick: () => {
                        router.push("/");
                    }, // URLを変更してルーティング
                    baseCSS: new BaseCSS({ margin: "15px 0" })
                })
            ]
        });
    }
}

// --- AppRouter の設定とアプリケーションのルート View ---

// ルート定義用のMapを作成
const appRoutes = new Map<string, View>();
appRoutes.set("/", new HomePage());
appRoutes.set("/about", new AboutPage());
appRoutes.set("/contact", new ContactPage());

/**
 * アプリケーションのルート View
 */
export class App extends View {
    override build(): View {
        return new Column({
            baseCSS: new BaseCSS({
                width: "100%",
                height: "95vh", // ページ全体をカバー
                background: "#f0f2f5"
            }),
            children: [
                // ここでAppRouterを配置し、現在のパスに基づいてページをレンダリングさせる
                new AppRouter({
                    routes: appRoutes,      // 定義したルートマップ
                    page404: new NotFoundPage(), // 404ページ
                    homePage: new HomePage(),    // ホームページ（パスが"/"の場合や、不正なパス形式の場合）
                    startPageRoute: window.location.pathname // アプリケーション起動時の現在のパス
                }),
                new ElevatedButton({
                    onClick: () => {
                        router.pop();
                    },
                    child: new Text({
                        text: "もどる"
                    })
                })
            ]
        });
    }
}

assembleView(new App());
```

## ライセンス 
MIT
