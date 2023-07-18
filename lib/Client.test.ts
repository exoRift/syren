import protoTest, { type TestFn } from 'ava'
import { Client } from './Client'
import { type TextChannel } from './structures/TextChannel'
import {
  type Guild,
  ApplicationCommandTypes,
  type ApplicationCommand,
  CommandInteraction,
  type User
} from 'oceanic.js'

interface Context {
  client: Client
  guild: Guild
  channel: TextChannel
  user: User
  command: ApplicationCommand
}

const test = protoTest as TestFn<Context>

test.beforeEach((t) => {
  t.context.client = new Client()
  t.context.guild = t.context.client.syren.createGuild()
  t.context.channel = t.context.client.getChannel<TextChannel>(t.context.guild.id)!
  t.context.user = t.context.client.syren.createUser()
  t.context.command = t.context.client.syren.registerCommand({
    name: 'command',
    description: 'A test command',
    type: ApplicationCommandTypes.CHAT_INPUT
  })
})

test('connecting', async (t) => {
  t.plan(1)

  await t.context.client.syren.connect()

  t.is(t.context.client.users.get(t.context.client.user.id)?.id, t.context.client.user.id, 'self user created')
})

test('command ran', (t) => {
  t.plan(2)

  t.context.client.once('interactionCreate', (interaction) => {
    t.assert(interaction instanceof CommandInteraction, 'command instance')

    t.is((interaction as CommandInteraction).data.name, t.context.command.name, 'command name matches')
  })

  return t.context.client.syren.callSlashCommand(t.context.channel, t.context.client.user, t.context.command.name)
})

test('message sent', (t) => {
  t.plan(1)

  t.context.client.once('messageCreate', (msg) => {
    t.is(msg.content, 'content', 'content matches')
  })

  return t.context.client.syren.sendMessage(t.context.channel, {
    content: 'content'
  })
})

test('custom message author', (t) => {
  t.plan(1)

  t.context.client.once('messageCreate', (msg) => {
    t.is(msg.author.id, t.context.user.id, 'author ID matches')
  })

  return t.context.client.syren.sendMessage(t.context.channel, {
    content: 'content'
  }, t.context.user)
})

test('message response', async (t) => {
  t.plan(2)

  const promise = new Promise((resolve) => {
    t.context.client.once('messageCreate', (msg) => {
      msg.channel?.createMessage({
        content: 'response'
      })
        .then((response) => {
          t.is(response.content, 'response', 'content matches')

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
  t.plan(2)

  const channel = t.context.client.syren.createGuildTextChannel()

  t.is(t.context.client.channelGuildMap[channel.id], channel.guildID, 'channel mapped correctly')
  t.true(channel.guild.channels.has(channel.id), 'guild contains channel')
})

test('reaction add', async (t) => {
  t.plan(3)

  const target = await t.context.channel.createMessage({ content: 'content' })

  t.context.client.once('messageReactionAdd', (msg, reactor, reaction) => {
    t.is(msg.id, target.id, 'message ID matches')
    t.is(reactor.id, t.context.client.user.id, 'user ID matches')
    t.is(reaction.name, '💀', 'emoji matches')
  })

  return await t.context.client.syren.addReaction(target, '💀')
})

test.todo('reaction remove')

test.todo('remove all reactions of emoji')

test.todo('remove all reactions')
