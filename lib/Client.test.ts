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
  t.context.client.once('interactionCreate', () => t.pass())

  t.context.client.sendFakeInteraction()
})

test('message sent', (t) => {
  t.context.client.once('messageCreate', (msg) => {
    t.is(msg.content, 'content')
  })

  t.context.client.sendFakeMessage('content')
})
