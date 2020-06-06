const yargs = require("yargs");
const fs = require("fs");
const path = require("path");
const argv = yargs.argv;

async function updatePkg() {
  const pkgContent = JSON.parse(
    await fs.promises.readFile(
      path.resolve(process.cwd(), "./package.json"),
      "utf8"
    )
  );

  console.log(`--name=${argv.name} --version=${argv.version}`);
  if (argv.name) pkgContent.name = argv.name;
  if (argv.version) pkgContent.version = argv.version;
  console.log("update-package.js: ", pkgContent);

  await fs.promises.writeFile(
    path.resolve(process.cwd(), "./package.json"),
    JSON.stringify(pkgContent)
  );

  console.log(`Update package.json success`);
}

updatePkg();
