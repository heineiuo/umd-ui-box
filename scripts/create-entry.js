const fs = require("fs").promises;
const path = require("path");
const yargs = require("yargs");

const argv = yargs.argv;

async function createEntry() {
  try {
    try {
      await fs.mkdir(path.resolve(process.cwd(), "./src"));
    } catch (e) {}
    const content = `export * from '${argv.pkg}';`;
    await fs.writeFile(
      path.resolve(process.cwd(), "./src/index.ts"),
      content,
      "utf8"
    );
    console.log("Create entry file success");
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

createEntry();
