import {
    View,
    Text,
    Column,
    ElevatedButton,
    BaseCSS,
    TextCSS,
    FontCSS,
    assembleView,
    setupDevMode,
    BorderCSS,
    ProviderObserver,
} from 'ftuttes';
import { AppRouter } from './transitus/components/appRouter';
import { Router } from './transitus/logic/router';

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

// --- アプリケーションのエントリーポイント ---

// 開発モードを有効にする（デバッグ時にViewの識別がしやすくなります）
setupDevMode(false);

assembleView(new App());
