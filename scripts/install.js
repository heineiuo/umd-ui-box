const semver = require("semver");
const simpleGit = require("simple-git/promise");
const childProcess = require("child_process");
const util = require("util");
const yargs = require("yargs");
const fs = require("fs");
const path = require("path");

const argv = yargs.argv;
const exec = util.promisify(childProcess.exec);

async function getSortedTagList(git) {
  const tagList = await git.tags({ "--sort": "creatordate" });
  const all = tagList.all.reverse();
  const latest = tagList.all[0];
  return { all, latest };
}

async function getTagName() {
  const git = simpleGit(process.cwd());
  const tagList = await getSortedTagList(git);
  if (!tagList.latest) {
    throw new Error("Error: No tags found.");
  }
  return tagList.latest;
}

async function updatePkg({ version }) {
  const pkgContent = JSON.parse(
    await fs.promises.readFile(
      path.resolve(process.cwd(), "./package.json"),
      "utf8"
    )
  );

  Object.assign(pkgContent, { version });

  console.log(pkgContent);

  await fs.promises.writeFile(
    path.resolve(process.cwd(), "./package.json"),
    JSON.stringify(pkgContent)
  );

  console.log(`Update package.json success`);
}

async function execInstall() {
  try {
    const tagName = await getTagName();
    const version = semver.clean(tagName).split("-")[0];
    const pkgName = argv.pkg;

    await fs.promises.copyFile(
      path.resolve(process.cwd(), "./package-lock.json"),
      path.resolve(process.cwd(), "./package-lock-backup.json")
    );

    console.log(`Run npm install ${pkgName}@${version} -D`);
    const installResult = await exec(`npm install ${pkgName}@${version} -D`);
    console.log(installResult.stdout);
    console.error(installResult.stderr);

    await updatePkg({ version: semver.clean(tagName) });

    await fs.promises.copyFile(
      path.resolve(process.cwd(), "./package-lock-backup.json"),
      path.resolve(process.cwd(), "./package-lock.json")
    );

    console.log(`Install ${pkgName}@${version} success`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

execInstall();
