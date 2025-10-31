#!/usr/bin/env node
import { parseArgs, printHelp } from "./cli";
import { run } from "./run";
import { CliOptions } from "./types";

async function main(): Promise<void> {
  let options: CliOptions;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error((error as Error).message);
    printHelp();
    process.exit(1);
    return;
  }

  if (options.helpRequested) {
    printHelp();
    return;
  }

  try {
    const exitCode = await run(options);
    process.exit(exitCode);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  void main();
}
