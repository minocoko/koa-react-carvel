import babel from 'rollup-plugin-babel';

export default [{
    input: './src/index.js',
    output: {
        file: './dist/index.cjs.js',
        format: 'cjs',
    },
    plugins: [
        babel({
            "babelrc": false,
            "presets": [
                [
                    "@babel/preset-env",
                    {
                        "modules": false,
                        "targets": {
                            "node": "current"
                        }
                    }
                ],
                "@babel/preset-react"
            ]
        })
    ]
},
{
    input: './src/index.js',
    output: {
        file: './dist/index.esm.js',
        format: 'esm',
    },
    plugins: [
        babel({
            "babelrc": false,
            "presets": [
                [
                    "@babel/preset-env",
                    {
                        "targets": {
                            "node": "current"
                        }
                    }
                ],
                "@babel/preset-react"
            ]
        })
    ]
}
]