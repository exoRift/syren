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
