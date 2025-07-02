import { DefaultRequestHandler } from "./middlewares/defaultRequestHandler";
import { TransitusServer } from "./server";
import { HotReload } from "./serverSettings/hotreload";

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
