

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});

// Ensure environment variables are read.
require('../config/env');

const chalk = require('chalk');
// const fs = require('fs-extra');
const webpack = require('webpack');
const bfj = require('bfj');
const configFactory = require('../config/webpack.config.server');
const paths = require('../config/paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const printBuildError = require('react-dev-utils/printBuildError');

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1);
}

// Process CLI arguments
const argv = process.argv.slice(2);
const writeStatsJson = argv.indexOf('--stats') !== -1;

// Generate configuration
const config = configFactory('development');
// Remove all content but keep the directory so that
// if you're in it, you don't end up in Trash
// fs.emptyDirSync(paths.appSsrBuild);
// Merge with the public folder
// copyPublicFolder();
// Start the webpack build

build(({ stats, warnings }) => {
    if (warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'));
        console.log(warnings.join('\n\n'));
        console.log(
            '\nSearch for the ' +
            chalk.underline(chalk.yellow('keywords')) +
            ' to learn more about each warning.'
        );
        console.log(
            'To ignore, add ' +
            chalk.cyan('// eslint-disable-next-line') +
            ' to the line before.\n'
        );
    } else {
        console.log(chalk.green('Compiled successfully.\n'));
    }
},
    err => {
        console.log(chalk.red('Failed to compile.\n'));
        printBuildError(err);
        // process.exit(1);
    }
)

// Create the production build and print the deployment instructions.
function build(success, fail) {
    console.log('Creating an watch build...');

    const compiler = webpack(config);

    compiler.watch({
        // Example watchOptions
        aggregateTimeout: 300,
        poll: undefined
    }, (err, stats) => {
        let messages;
        if (err) {
            if (!err.message) {
                return fail(err);
            }
            messages = formatWebpackMessages({
                errors: [err.message],
                warnings: [],
            });
        } else {
            messages = formatWebpackMessages(
                stats.toJson({ all: false, warnings: true, errors: true })
            );
        }
        if (messages.errors.length) {
            // Only keep the first error. Others are often indicative
            // of the same problem, but confuse the reader with noise.
            if (messages.errors.length > 1) {
                messages.errors.length = 1;
            }
            return fail(new Error(messages.errors.join('\n\n')));
        }
        if (
            process.env.CI &&
            (typeof process.env.CI !== 'string' ||
                process.env.CI.toLowerCase() !== 'false') &&
            messages.warnings.length
        ) {
            console.log(
                chalk.yellow(
                    '\nTreating warnings as errors because process.env.CI = true.\n' +
                    'Most CI servers set it automatically.\n'
                )
            );
            return fail(new Error(messages.warnings.join('\n\n')));
        }

        const resolveArgs = {
            stats,
            warnings: messages.warnings,
        };
        if (writeStatsJson) {
            return bfj
                .write(paths.appSsrBuild + '/bundle-stats.json', stats.toJson())
                .then(() => success(resolveArgs))
                .catch(error => fail(new Error(error)));
        }

        return success(resolveArgs);
    });
}
