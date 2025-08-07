const { spawn } = require("child_process");

function run(command, args, cwd) {
  return spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true
  });
}

run("npm", ["install"], "./neru-bot")
  .on("close", () => {
    run("npm", ["install"], "./teto-bot")
      .on("close", () => {
        run("node", ["index.js"], "./neru-bot");
        run("node", ["index.js"], "./teto-bot");
      });
  });