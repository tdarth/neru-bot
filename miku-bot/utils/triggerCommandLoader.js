const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  client.triggers = [];

  const commandsPath = path.join(__dirname, '../events/commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    console.log(`Loading command: ${file}`)
    const commandPath = path.join(commandsPath, file);
    const command = require(commandPath);
    if (command.trigger && command.execute) {
      client.triggers.push(command);
    }
  }
};
