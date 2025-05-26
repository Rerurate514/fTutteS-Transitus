import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const index = {
    input: 'dist/index.js',
    output: [
        {
            file: 'dist/index.js',
            format: 'esm',
            sourcemap: true,
        },
    ],
    plugins: [
        typescript(),
        nodeResolve({
            browser: false,
        }),
        commonjs(),
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
    ],
};

const script = {
    input: 'src/script.ts',
    output: [
        {
            file: 'dist/bundle.js',
            format: 'umd',
            sourcemap: true,
            name: 'transitus',
            exports: "auto"
        },
    ],
    plugins: [
        typescript(),
        nodeResolve({
            browser: true,
        }),
        commonjs(),
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
    ],
};

const server_run = {
    input: 'src/transitus/logic/run.ts',
    output: [
        {
            file: 'dist/run.esm.js',
            format: 'es',
            sourcemap: true,
        },
    ],
    plugins: [
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
        nodeResolve({
            browser: true,
        }),
        commonjs(),
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
    ],
};

export default [ index ];
