import babel from 'rollup-plugin-babel';

export default {
    input: './src/index.js',
    output: [
        {
            exports: 'named',
            file: './dist/index.cjs.js',
            format: 'cjs',
        },
        {
            exports: 'named',
            file: './dist/index.esm.js',
            format: 'esm',
        }
    ],
    plugins: [
        babel()
    ]
}