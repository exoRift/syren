import protoTest, { type TestFn } from 'ava'
import { Client } from './Client'

interface Context {
  client: Client
}

const test = protoTest as TestFn<Context>

test.before((t) => {
  t.context.client = new Client()
})

test('command ran', (t) => {
  t.context.client.once('interactionCreate', () => t.pass('interaction registered'))

  t.context.client.sendFakeInteraction()
})

test.todo('command response')

test('message sent', (t) => {
  t.context.client.once('messageCreate', (msg) => {
    t.is(msg.content, 'content', 'content matches')
  })

  return t.context.client.sendFakeMessage({
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

  await t.context.client.sendFakeMessage({
    content: 'initial'
  })

  return await promise
})
