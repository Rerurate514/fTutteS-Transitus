import { LimitedProviderScope, Provider, View } from "ftuttes";

interface AppRouterInterface {
    routes: Map<string, View>,
    page404: View,
    homePage: View,
    startPageRoute: string,
}

/**
 * pathProvider
 * ## OverView
 * 現在のブラウザのURLパス名（`window.location.pathname`）を管理するグローバルな`Provider`です。
 * アプリケーションのルーティング状態の基盤として機能します。
 * `AppRouter`はこの`pathProvider`を内部的に利用し、URLの変更を検知して適切なViewをレンダリングします。
 *
 * ## Usage
 * この`Provider`は通常、直接`read()`や`watch()`するよりも、`AppRouter`を通じて暗黙的に利用されます。
 * ただし、特定の状況で現在のパス名に直接アクセスしたり、パス名の変更を監視したい場合に利用できます。
 *
 * @example
 * ```typescript
 * import { pathProvider, assembleView, Text, Column, LimitedProviderScope } from 'ftuttes';
 *
 * // Simple application that displays the current path
 * assembleView(
 *   new Column({
 *     children: [
 *       new Text({
 *         text: "現在のパス:",
 *         textCSS: new TextCSS({
 *           fontCSS: new FontCSS({
 *             fontSize: "20px"
 *           })
 *         })
 *       }),
 *       new LimitedProviderScope({
 *         providers: [pathProvider],
 *         builder: ([currentPath]) =>
 *           new Text({
 *             text: currentPath,
 *             textCSS: new TextCSS({
 *               fontCSS: new FontCSS({
 *                 fontSize: "24px",
 *                 color: "blue"
 *               })
 *             })
 *           })
 *       })
 *     ]
 *   })
 * );
 * ```
 */
export const pathProvider = Provider.createProvider(() => {
    return window.location.pathname;
}, "transitus__pathProvider");

/**
 * AppRouterクラス
 * ## OverView
 * fTutteSフレームワークにおけるシングルページアプリケーション（SPA）のルーティングを管理するウィジェットです。
 * ブラウザのURLパス名に基づいて、対応する`View`コンポーネントを動的に切り替えて表示します。
 *
 * `AppRouter`は`pathProvider`を購読し、`popstate`イベント（ブラウザの「戻る」「進む」操作など）を監視して、
 * URLの変更時に自動的に表示されるページを更新します。
 *
 * ## Props
 * @param props - AppRouterの設定オプション。
 * @param props.routes - 必須 ルートパスとそれに対応する`View`コンポーネントのマッピングを定義する`Map`オブジェクト。
 * @param props.page404 - 必須 定義された`routes`に一致しないパスにアクセスされた場合に表示する404エラーページ用の`View`インスタンス。
 * @param props.homePage - 必須 アプリケーションのルートパス（`/`）またはパスが未指定の場合に表示するホームページ用の`View`インスタンス。
 * @param props.startPageRoute - 必須 アプリケーションが最初にロードされたときに表示を開始するルートのパス。
 *
 * ## Examples
 * 基本的なAppRouterの使用例
 * @example
 * ```typescript
 * import {
 *   AppRouter,
 *   View,
 *   Text,
 *   Column,
 *   ElevatedButton,
 *   assembleView,
 *   BaseCSS,
 *   TextCSS,
 *   FontCSS,
 *   pathProvider
 * } from 'ftuttes';
 *
 * // defined pages
 * class HomePage extends View {
 *   override build(): View {
 *     return new Column({
 *       baseCSS: new BaseCSS({
 *         margin: "20px"
 *       }),
 *       children: [
 *         new Text({
 *           text: "Home Page",
 *           textCSS: new TextCSS({
 *             fontCSS: new FontCSS({
 *               fontSize: "30px",
 *               color: "green"
 *             })
 *           })
 *         }),
 *         new ElevatedButton({
 *           text: "Go to AboutPage",
 *           onClick: () => { pathProvider.update(() => "/about"); }
 *         })
 *       ]
 *     });
 *   }
 * }
 *
 * class AboutPage extends View {
 *   override build(): View {
 *     return new Column({
 *       baseCSS: new BaseCSS({
 *         margin: "20px"
 *       }),
 *       children: [
 *         new Text({
 *           text: "AboutPage",
 *           textCSS: new TextCSS({
 *             fontCSS: new FontCSS({
 *               fontSize: "30px",
 *               color: "blue"
 *             })
 *           })
 *         }),
 *         new ElevatedButton({
 *           text: "back to HomePage",
 *           onClick: () => { pathProvider.update(() => "/"); }
 *         })
 *       ]
 *     });
 *   }
 * }
 * 
 * // defined routes
 * const routes = new Map<string, View>();
 * routes.set("/", new HomePage());
 * routes.set("/about", new AboutPage());
 *
 * // AppRouter
 * const appRouter = new AppRouter({
 *   routes: routes,
 *   page404: new NotFoundPage(),
 *   homePage: new HomePage(), // Display HomePage even when the root path is not specified
 *   startPageRoute: "/" // Set the path at the start of the application as the initial value
 * });
 *
 * assembleView(appRouter);
 *
 * ```
 */
export class AppRouter extends View {
    private provider: Provider<string>;

    constructor(protected props: AppRouterInterface) {
        super();

        const currentPathProvider = Provider.createProvider((ref) => {
            ref.watch(pathProvider, (path) => {
                return path;
            });

            return ref.read(pathProvider);
        }, "transitus__currentPathProvider");

        this.provider = currentPathProvider;
    }

    override embedScriptToView(element: HTMLElement): HTMLElement {
        window.addEventListener("popstate", () => {
            this.provider.update(() => window.location.pathname);
        });

        return element;
    }

    override build(): View {
        return new LimitedProviderScope({
            providers: [ this.provider ],
            builder: (currentPage) => {
                const pageComponent = this.props.routes.get(currentPage[0]);

                if (!currentPage[0]) return this.props.homePage;
                if (!pageComponent) return this.props.page404;

                return pageComponent;
            }
        });
    }
}
