import protoTest, { type TestFn } from 'ava'
import { Client } from './Client'
import { type TextChannel, type Guild } from 'oceanic.js'

interface Context {
  client: Client
  guild: Guild
  channel: TextChannel
}

const test = protoTest as TestFn<Context>

test.before((t) => {
  t.context.client = new Client()
  t.context.guild = t.context.client.syren.createGuild()
  t.context.channel = t.context.client.getChannel<TextChannel>(t.context.guild.id)!
})

test.todo('command ran'/* , (t) => {
  t.context.client.once('interactionCreate', () => t.pass('interaction registered'))

  t.context.client.sendFakeCommand()
} */)

test.todo('command response')

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
