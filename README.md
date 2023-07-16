[![Test Coverage](https://api.codeclimate.com/v1/badges/a9bb5636ab60166076ed/test_coverage)](https://codeclimate.com/github/exoRift/syren/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/a9bb5636ab60166076ed/maintainability)](https://codeclimate.com/github/exoRift/syren/maintainability)

[![Discord Server](https://img.shields.io/badge/-Support%20Server-b.svg?colorA=697ec4&colorB=7289da&logo=discord)](https://discord.gg/Rqd8SJ9)

[![Version](https://img.shields.io/github/package-json/v/exoRift/syren.svg?label=Version)](https://www.npmjs.com/package/syren)
[![NPM Downloads](https://img.shields.io/npm/dt/syren?label=Downloads&logo=npm)](https://www.npmjs.com/package/syren)

# Syren
Syren is a small library to assist in testing expected interactions with the Discord API for things such as Discord bots or Discord bot frameworks

## Example Test
```ts
import protoTest, { type TestFn } from 'ava'
import { spy, match } from 'sinon'
import { Client } from 'syren'
import { type TextChannel } from 'oceanic.js'

interface Context {
  client: Client
  channel: TextChannel
}

const test = protoTest as TestFn<Context>

test.before((t) => {
  t.context.client = new Client()
  t.context.channel = t.context.client.syren.createChannel()
})

test('ping command', async (t) => {
  const spy = spy(t.context.channel, 'createMessage')

  // register your ping command here
  // ...

  await t.context.client.syren.sendMessage({
    content: '!ping'
  })

  spy.calledWith(match({ content: 'Pong!' }))
})
```

#### NOTE: Syren is in a very early stage of development with limited capability. To add functionality, feel free to [create a PR](https://github.com/exoRift/syren/compare)