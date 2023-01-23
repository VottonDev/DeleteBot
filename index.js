require('dotenv').config();
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const DiscordClient = new Client({
  intents: GatewayIntentBits.Guilds,
  messageCacheMaxSize: 0,
  disableMentions: 'everyone',
});

DiscordClient.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    DiscordClient.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

const DelayBetween = 60 * 1000;
const DayMs = 24 * 60 * 60 * 1000;
const InitialSpread = 60 * 60 * 1000;
const RecurringSpread = 30 * 60 * 1000;
const IntervalExtension = DayMs / 2;
const MinInterval = 10 * 60 * 1000; //(+RecurringSpread)

const TwoWeekOffset = 14 * 24 * 60 * 60 * 1000;

const ChannelConfigs = new Map();

function ChannelName(channel) {
  return channel.guild != null ? channel.guild.name + ' #' + channel.name : '#' + channel.name;
}
function Log(msg) {
  console.log(new Date().toTimeString().substring(0, 9) + msg);
}

async function Wipe(channelConfig, reWipe) {
  let interval = channelConfig.int;
  let channel = channelConfig.channel;

  try {
    let now = Date.now();
    let wipeSnowstamp = (BigInt(now - 14200704e5 /*DISCORD_EPOCH*/ - channelConfig.ttl) << 22n).toString();
    let twoWeeksAgo = now - TwoWeekOffset;
    let messages = await channel.messages.fetch({ limit: 100, before: wipeSnowstamp }, false);
    messages = messages.filter((message) => message.createdTimestamp > twoWeeksAgo); // because before and after are mutually
    // exclusive in the query
    let fetchSize = messages.size;
    messages = messages.filter((message) => !message.pinned);
    if (messages.size !== 0) {
      Log(`Deleting ${messages.size} messages in ${ChannelName(channel)}`);
      await channel.bulkDelete(messages);

      if (interval > DayMs) channelConfig.int = interval = DayMs; // in case it was extended before

      if (fetchSize === 100) {
        channelConfig.t = setTimeout(Wipe, DelayBetween, channelConfig, true);
        if (interval > MinInterval) channelConfig.int = Math.min(interval / 2, MinInterval);
        return;
      }
      if (interval < DayMs) channelConfig.int = interval = Math.max(interval * 2, DayMs);
    } else if (!reWipe) {
      if (channelConfig.ttl < /*6 days*/ 518400000) {
        if (interval < /*6 days*/ 518400000) {
          channelConfig.int = interval += IntervalExtension;
        }
      } else if (interval >= DayMs) {
        let messages = await channel.messages.fetch({ limit: 1, after: wipeSnowstamp }, false);
        if (messages.size !== 0) interval = Math.max(messages.first().createdTimestamp + channelConfig.tll - now, DayMs);
        else interval = channelConfig.ttl + DayMs;
      }
    }
  } catch (err) {
    // If we lack acccess or permissions, we'll log it.
    if (err.code === 50013 || err.code === 50001) {
      DeleteChannel(channel.id);
      Log(`${ChannelName(channel)}: ${err.message}`);
      // Post to channel that the bot is lacking required permissions.
      channel.send(`${ChannelName(channel)}: ${err.message}`);
      return;
    } else console.error(err);
  }

  channelConfig.t = setTimeout(Wipe, interval + Math.random * RecurringSpread, channelConfig);
}

let MyId;

async function DeleteOldAnnounce(channel) {
  try {
    let pins = await channel.messages.fetchPinned(false);
    let announcePin = pins.find((message) => message.author != null && message.author.id === MyId);
    if (announcePin != null) await announcePin.delete();
  } catch (err) {}
}

function AddChannel(matches, channel, announce) {
  let param = matches.length === 1 ? matches[0].substring(9).trimStart() : matches.map((x) => x.substring(9).trimStart()).sort((a, b) => b.length - a.length)[0];
  param = param === '' ? 7 : Math.min(12, Math.max(param, 1));
  let channelConfig = { ttl: param * DayMs, int: DayMs, channel };
  ChannelConfigs.set(channel.id, channelConfig);
  channelConfig.t = setTimeout(Wipe, Math.random * InitialSpread, channelConfig, true);
  Log(`Adding ${ChannelName(channel)} with a ${param} day wipe`);
  if (announce) {
    DeleteOldAnnounce(channel).then(() =>
      channel
        .send('The messages will be deleted after ' + (param === 1 ? 'one day' : param + ' days'))
        .then((message) => message.pin().catch())
        .catch()
    );
  }
}

function DeleteChannel(channelId) {
  let channelConfig = ChannelConfigs.get(channelId);
  if (channelConfig !== undefined) {
    clearTimeout(channelConfig.t);
    ChannelConfigs.delete(channelId);
    Log('Deleting ' + ChannelName(channelConfig.channel));
    return true;
  }
  return false;
}

const DeletebotRegex = /DeleteBot\s*(\d{1,3})?/gi;

function ProcessGuild(guild) {
  for (let channel of guild.channels.cache.values()) {
    let topic = channel.topic;
    if (topic != null && topic.length >= 9) {
      let matches = topic.match(DeletebotRegex);
      if (matches !== null) {
        AddChannel(matches, channel);
      }
    }
  }
}

DiscordClient.on('ready', () => {
  Log(`Logged in as ${DiscordClient.user.tag}!`);
  DiscordClient.user.setActivity('Deleting messages', { type: 'WATCHING' });
  MyId = DiscordClient.user.id;
  DiscordClient.on('error', console.error);

  for (let guild of DiscordClient.guilds.cache.values()) {
    ProcessGuild(guild);
  }
});

DiscordClient.on('channelDelete', (channel) => {
  if (channel.type !== 'voice' && channel.type !== 'category') DeleteChannel(channel.id);
});

DiscordClient.on('guildDelete', (guild) => {
  for (let channel of guild.channels.cache.values()) {
    if (channel.type !== 'voice' && channel.type !== 'category') DeleteChannel(channel.id);
  }
});

DiscordClient.on('guildCreate', ProcessGuild);

DiscordClient.on('channelUpdate', async (oldChannel, newChannel) => {
  if (newChannel.type === 'voice' || newChannel.type === 'category' || oldChannel.topic === newChannel.topic) return;

  let announceDelete = DeleteChannel(newChannel.id);

  let topic = newChannel.topic;
  if (topic != null && topic.length >= 9) {
    let matches = topic.match(DeletebotRegex);
    if (matches !== null) {
      AddChannel(matches, newChannel, true);
      announceDelete = false;
    }
  }

  if (announceDelete) {
    newChannel.send('The messages will not be automatically deleted').catch(console.error);
    await DeleteOldAnnounce(newChannel);
  }
});
DiscordClient.on('rateLimit', (rateLimitInfo) => {
  if (rateLimitInfo.global) {
    let time = rateLimitInfo.reset * 1000;
    Log(`Rate limit exceeded. Reset at ${new Date(time).toLocaleString()}`);
    setTimeout(() => {
      Log('Rate limit cleared, resuming.');
    }, time - Date.now());
  }
});

DiscordClient.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

const dbl = require('dblapi.js');
new dbl(process.env.DBLTOKEN, DiscordClient);
DiscordClient.login(process.env.TOKEN)
  .then(() => Log(`Logged in as ${DiscordClient.user.tag}!`))
  .catch(console.error);
