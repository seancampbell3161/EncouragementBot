const Discord = require("discord.js");
const fetch = require("node-fetch");
const keepAlive = require("./server");
const Database = require("@replit/database");

const db = new Database();
const client = new Discord.Client();

const sadWords = ["sad", "depressed", "unhappy", "angry"];

const starterEncouragements = [
  "You're doing great!",
  "Hang in there.",
  "You are a great human!"
]

db.get("encouragements").then(encouragements => {
  if(!encouragements || encouragements.length < 1) {
    db.set("encouragements", starterEncouragements); // key / value
  }
});

// Check whether should respond to sad words
db.get("responding").then(value => {
  // first time run
  if(value == null) {
    db.set("responding", true);
  }
});

function updateEncouragements(encouragingMessage) {
  db.get("encouragements").then(encouragements => {
    encouragements.push([encouragingMessage]);
    db.set("encouragements", encouragements); //key / value
  });
}

function deleteEncouragement(index) {
  db.get("encouragements").then(encouragements => {
    if(encouragements.length > index) {
      encouragements.splice(index, 1);
      db.set("encouragements", encouragements); // key / value
    }
  });
}

function getQuote() {
  return fetch("https://zenquotes.io/api/random")
  .then(res => {
    return res.json();
  })
  .then(data => {
    // "q" quote "a" author
    return data[0]["q"] + " -" + data[0]["a"];
  });
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// whenever the bot sees a message
client.on("message", msg => {
  if(msg.author.bot) return;

  if(msg.content === "!inspire") {
    // get the result, THEN... take the quote and send message to channel
    getQuote().then(quote => msg.channel.send(quote));
  }

  db.get("responding").then(responding => {
    if(responding && sadWords.some(word => msg.content.includes(word))) {
      db.get("encouragements").then(encouragements => {
        const encouragement = encouragements[Math.floor(Math.random() *
        encouragements.length)];
        msg.reply(encouragement);
      });   
    }
  });
  

  // user add a new custom message
  if(msg.content.startsWith("$new")) {
    encouragingMessage = msg.content.split("$new ")[1];
    updateEncouragements(encouragingMessage);
    msg.channel.send("Encouraging message added.");
  }

  // user delete an encouraging message
  if(msg.content.startsWith("$del")) {
    index = parseInt(msg.content.split("$del ")[1]); //number = index of array
    deleteEncouragement(index);
  }

  if(msg.content.startsWith("$list")) {
    db.get("encouragements").then(encouragements => {
      msg.channel.send(encouragements);
    });
  }

  if(msg.content.startsWith("$responding")) {
    value = msg.content.split("$responding ")[1];

    if(value.toLowerCase() == "true") {
      db.set("responding", true);
      msg.channel.send("Responding is on.");
    } else if(value.toLowerCase() == "false") {
      db.set("responding", false);
      msg.channel.send("Responding is off.");
    }
  }

});

// start server
keepAlive();
const mySecret = process.env['TOKEN']
client.login(mySecret);