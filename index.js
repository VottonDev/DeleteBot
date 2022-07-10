require('dotenv').config();
const Discord = require('discord.js');
const IntentFlag = Discord.Intents.FLAGS;
const DiscordClient = new Discord.Client({
  ws: {
    intents: IntentFlag.GUILDS, //|
    //IntentFlag.GUILD_MEMBERS |
    //IntentFlag.GUILD_MESSAGES |
    //IntentFlag.GUILD_MESSAGE_REACTIONS
  },
  messageCacheMaxSize: 0,
  disableMentions: 'everyone',
});

const DelayBetween = 60 * 1000;
const DayMs = 24 * 60 * 60 * 1000;
const InitialSpread = 60 * 60 * 1000;
const RecurringSpread = 30 * 60 * 1000;
const IntervalExtension = DayMs / 2;
const MinInterval = 10 * 60 * 1000; //(+RecurringSpread)

const TwoWeekOffset = 14 * 24 * 60 * 60 * 1000;

var ChannelConfigs = new Map();

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
    messages = messages.filter((message) => message.createdTimestamp > twoWeeksAgo); //because before and after are mutually exclusive in the query
    let fetchSize = messages.size;
    messages = messages.filter((message) => !message.pinned);
    if (messages.size !== 0) {
      Log(`Deleting ${messages.size} messages in ${ChannelName(channel)}`);
      await channel.bulkDelete(messages);

      if (interval > DayMs) channelConfig.int = interval = DayMs; //in case it was extended before

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
        if (messages.size !== 0) interval = Math.max(messages[0].createdTimestamp + channelConfig.ttl - now, DayMs);
        else interval = channelConfig.ttl + DayMs;
      }
    }
  } catch (err) {
    // If we lack acccess or permissions, we'll log it.
    if (err.code === 50013 || err.code === 50001) {
      DeleteChannel(channel.id);
      Log(`${ChannelName(channel)}: ${err.message}`);
      return;
    } else console.error(err);
  }

  channelConfig.t = setTimeout(Wipe, interval + Math.random * RecurringSpread, channelConfig);
}

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

var MyId;
DiscordClient.on('ready', () => {
  console.log(`Logged in as ${DiscordClient.user.tag}!`);
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
    console.log(`Ratelimited, waiting until ${new Date(time).toLocaleString()}`);
    setTimeout(() => {
      console.log('Ratelimit cleared, resuming');
    }, time - Date.now());
  }
});
new (require('dblapi.js'))(process.env.DBLTOKEN, DiscordClient);
DiscordClient.login(process.env.TOKEN).then(() => console.log(`Logged in as ${DiscordClient.user.tag}!`));
