const fs = require("fs").promises;

class StoreQueue {
  constructor() {
    this.queue = [];
    this.isWriting = false;
  }

  async enqueue(filepath, id, username, song, vote) {
    return new Promise((resolve, reject) => {
      this.queue.push({ filepath, id, username, song, vote, resolve, reject });
      if (!this.isWriting) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    this.isWriting = true;

    while (this.queue.length > 0) {
      const { filepath, id, username, song, vote, resolve, reject } = this.queue.shift();

      try {
        let data;
        try {
          const fileContent = await fs.readFile(filepath, "utf-8");
          data = JSON.parse(fileContent);
          if (!Array.isArray(data.users)) data.users = [];
        } catch (e) {
          if (e.code === "ENOENT") {
            data = { users: [] };
          } else {
            throw e;
          }
        }

        let user = data.users.find((u) => u.id === id);
        if (!user) {
          user = { id, username, votes: [] };
          data.users.push(user);
        } else {
          user.username = username;
        }

        user.votes.push({ song, vote });

        await fs.writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");

        resolve();
      } catch (err) {
        reject(err);
      }
    }

    this.isWriting = false;
  }
}

const storeQueue = new StoreQueue();

function store(filepath, id, username, song, vote) {
  return storeQueue.enqueue(filepath, id, username, song, vote);
}

module.exports = { store };