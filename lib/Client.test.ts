import protoTest, { type TestFn } from 'ava'
import { Client } from './Client'
import { type TextChannel } from './structures/TextChannel'
import {
  type Guild,
  ApplicationCommandTypes,
  type ApplicationCommand,
  CommandInteraction
} from 'oceanic.js'

interface Context {
  client: Client
  guild: Guild
  channel: TextChannel
  command: ApplicationCommand
}

const test = protoTest as TestFn<Context>

test.before((t) => {
  t.context.client = new Client()
  t.context.guild = t.context.client.syren.createGuild()
  t.context.channel = t.context.client.getChannel<TextChannel>(t.context.guild.id)!
  t.context.command = t.context.client.syren.registerCommand({
    name: 'command',
    description: 'A test command',
    type: ApplicationCommandTypes.CHAT_INPUT
  })
})

test('connecting', async (t) => {
  await t.context.client.syren.connect()

  t.is(t.context.client.users.get(t.context.client.user.id)?.id, t.context.client.user.id, 'self user created')
})

test('command ran', (t) => {
  t.context.client.once('interactionCreate', (interaction) => {
    t.assert(interaction instanceof CommandInteraction, 'command instance')

    t.is((interaction as CommandInteraction).data.name, t.context.command.name, 'command name matches')
  })

  t.context.client.syren.callCommand(t.context.channel, t.context.client.user, t.context.command.name)
})

test('message sent', (t) => {
  t.context.client.once('messageCreate', (msg) => {
    t.is(msg.content, 'content', 'content matches')
  })

  return t.context.client.syren.sendMessage(t.context.channel, {
    content: 'content'
  })
})

test('message response', async (t) => {
  const promise = new Promise((resolve) => {
    t.context.client.once('messageCreate', (msg) => {
      msg.channel?.createMessage({
        content: 'response'
      })
        .then((response) => {
          t.is(response.content, 'response')

          t.assert(response.channel.messages.has(response.id), 'response message exists')
        })
        .catch(t.fail)
        .finally(() => resolve(undefined))
    })
  })

  await t.context.client.syren.sendMessage(t.context.channel, {
    content: 'initial'
  })

  return await promise
})

test('create channel without guild', (t) => {
  const channel = t.context.client.syren.createGuildTextChannel()

  t.is(t.context.client.channelGuildMap[channel.id], channel.guildID)
})
