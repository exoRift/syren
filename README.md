# Syren
Syren is a small library to assist in testing expected interactions with the Discord API for things such as Discord bots or Discord bot frameworks

## Example Test
```ts
import protoTest, { type TestFn } from 'ava'
import { spy, match } from 'sinon'
import { Client } from 'syren'

interface Context {
  client: Client
}

const test = protoTest as TestFn<Context>

test.before((t) => {
  t.context.client = new Client()
})

test('ping command', async (t) => {
  const spy = spy(t.context.client.fakeChannel, 'createMessage')

  // register your ping command here
  // ...

  await t.context.client.sendFakeMessage({
    content: '!ping'
  })

  spy.calledWith(match({ content: 'Pong!' }))
})
```

#### NOTE: Syren is in a very early stage of development with limited capability. To add functionality, feel free to [create a PR](https://github.com/exoRift/syren/compare)