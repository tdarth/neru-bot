const { spawn } = require("child_process");

function run(command, args, cwd) {
  return spawn(command, args, {
    cwd,
    stdio: "inherit"
  });
}

run("npm", ["install"], "./neru-bot")
  .on("close", () => {
    run("npm", ["install"], "./teto-bot")
      .on("close", () => {
        // run("npm", ["install"], "./cadmium")
          // .on("close", () => {
            run("npm", ["install"], "./miku-bot")
              .on("close", () => {
                run("npm", ["install"], "./tagroles")
                  .on("close", () => {
                    run("npm", ["install"], "./modmail")
                      .on("close", () => {
                        run("node", ["index.js"], "./neru-bot");
                        run("node", ["index.js"], "./teto-bot");
                        // run("node", ["index.js"], "./cadmium");
                        run("node", ["index.js"], "./miku-bot");
                        run("node", ["index.js"], "./tagroles");
                        run("node", ["index.js"], "./modmail");
                      });
                  });
              });
          // });
      });
  });

console.log("Began startup script.");