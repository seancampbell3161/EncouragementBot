const express = require("express");
const server = express();

// respond to all http req
server.all("/", (req, res) => {
  res.send("Bot is running!");
});

// start server
function keepAlive() {
  server.listen(3000, () => {
    console.log("Server is ready");
  });
}

module.exports = keepAlive