const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { token, forbiddenWords, ownerId } = require('./config.json');
const { readdirSync } = require("fs");
const path = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ]
});

console.log('[Miko] Loading...');

client.on("ready", async () => {
    console.log(`MIKO DISCORD logged in as ${client.user.tag}.`);
    client.user.setPresence({ activities: [{ name: 'Lurking' }], status: 'idle' });

    const channelId = "1343548241479860237";

    try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            await channel.send("Miko is online!");
        } else {
            console.error("Channel not found!");
        }
    } catch (error) {
        console.error("Error sending startup message:", error);
    }

    try {
        const currentTime = new Date().toLocaleString();
        const owner = await client.users.fetch(ownerId);
        if (owner) {
            await owner.send(`MIKO has started up successfully! Start up time: ${currentTime}`);
            console.log("Sent startup message to the owner.");
        } else {
            console.error("Owner not found!");
        }
    } catch (error) {
        console.error("Error sending message to the owner:", error);
    }
});

client.on("messageCreate", async function(message) {
  if (message.author == client.user || message.author.bot) return;

  const args = message.content.split(' ');
  const command = args.shift().toLowerCase();

  if (command === '!mute') {
    if (!message.member.permissions.has('MODERATE_MEMBERS')) {
      return message.reply("You don't have permission to use this command.");
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply("Please mention a user to mute.");
    }

    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.reply("User not found.");
    }

    const duration = parseInt(args[1]) * 600000; 
    if (isNaN(duration)) {
      return message.reply("Please specify a valid duration in seconds.");
    }

    try {
      await member.timeout(duration, 'Muted by command');
      message.channel.send(`${user.tag} has been muted for ${args[1]} seconds.`);
    } catch (error) {
      console.error(error);
      message.reply("An error occurred while trying to mute the user.");
    }
    return;
  }

  if (command === '!ban') {
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply("You don't have permission to use this command.");
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply("Please mention a user to ban.");
    }

    const member = message.guild.members.cache.get(user.id);
    if (!member) {
      return message.reply("User not found.");
    }

    try {
      await member.ban({ reason: 'Banned by command' });
      message.channel.send(`${userId} has been banned.`);
    } catch (error) {
      console.error(error);
      message.reply("I'm sorry Dave, I'm afraid I can't do that.");
    }
    return;
  }

  if (command === '!unban') {
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply("You don't have permission to use this command.");
    }

    const userId = args[0];
    if (!userId) {
      return message.reply("Please provide the ID of the user to unban.");
    }

    try {
      await message.guild.members.unban(userId);
      message.channel.send(`User with ID ${userId} has been unbanned.`);
    } catch (error) {
      console.error(error);
      message.reply("I'm sorry Dave, I'm afraid I can't do that.");
    }
    return;
  }

  if (forbiddenWords.some(word => message.content.includes(word))) {
    try {
      await message.delete();
      await message.member.timeout(600000, 'Admin timed you out.');
      message.channel.send(`${message.author}, your message contained a forbidden word and was deleted.`);
      console.log('Timed user out for 9000 seconds.');
      await message.author.send('Your message contained a forbidden word and was deleted. If you continue to break the rules, you will be banned.');
    } catch (error) {
      console.error(error);
    }
    return;
  }

  if (message.content === 'owo') {
    message.channel.send("uwu");
  }
  if (message.content === "uwu") {
    message.channel.send("owo");
  }
});

client.login(token);