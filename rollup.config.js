import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const nodeExternals = [
    'commander',
    'events',
    'fs',
    'path',
    'util',
];

const libraryConfig = {
    input: 'dist/index.js',
    output: [
        {
            file: 'dist/index.js',
            format: 'cjs'
        },
        {
            file: 'dist/index.mjs',
            format: 'es'
        },
        {
            file: 'dist/bundle.js',
            format: 'umd',
            name: 'Transitus',
            sourcemap: true,
            globals: {
                ftuttes: 'ftuttes',
            }
        },
        {
            file: 'dist/bundle.esm.js',
            format: 'es',
            sourcemap: true,
        },
        {
            file: 'dist/index.ts',
            format: 'esm',
        },
    ],
    external: [
        ...nodeExternals, // 既存のNode.js外部モジュール
        'ftuttes', // <--- これを追加: ftuttesをバンドルに含めない
        // もしftuttesがサブパスを持つ場合、それらも外部化する（例: 'ftuttes/core', 'ftuttes/material' など）
        // Rollupはデフォルトでモジュール識別子全体を外部化するため、'ftuttes'だけで十分なことが多い
    ],
    plugins: [
        terser({
            compress: {
                dead_code: true,
                conditionals: true,
                collapse_vars: true
            },
            mangle: {
                keep_classnames: true,
                keep_fnames: true
            },
            format: {
                comments: false,
                beautify: false
            },
            ecma: 2015
        }),
        commonjs(),
        nodeResolve({
            browser: true,
        }),
        typescript({
            declaration: false,
            compilerOptions: {
                target: 'esnext',
                module: 'esnext',
            },
            transformers: [
                service => ({
                    before: [
                        context => node => {
                            return node;
                        }
                    ],
                    after: []
                })
            ]
        }),
    ]
};

export default [libraryConfig];
