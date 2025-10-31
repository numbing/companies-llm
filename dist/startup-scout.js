#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("./cli");
const run_1 = require("./run");
async function main() {
    let options;
    try {
        options = (0, cli_1.parseArgs)(process.argv.slice(2));
    }
    catch (error) {
        console.error(error.message);
        (0, cli_1.printHelp)();
        process.exit(1);
        return;
    }
    if (options.helpRequested) {
        (0, cli_1.printHelp)();
        return;
    }
    try {
        const exitCode = await (0, run_1.run)(options);
        process.exit(exitCode);
    }
    catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}
if (require.main === module) {
    void main();
}
