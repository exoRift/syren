import {
  type CreateMessageOptions,
  TextChannel as OTextChannel,
  Message,
  MessageTypes
} from 'oceanic.js'

import { type Client } from '../Client'

export class TextChannel extends OTextChannel {
  client!: Client

  async createMessage (options: CreateMessageOptions): Promise<Message<OTextChannel>> {
    const message = new Message<TextChannel>({
      attachments: [],
      author: this.client._fakeUserRaw,
      channel_id: 'test_channel',
      content: options.content ?? '',
      edited_timestamp: 'ts',
      embeds: [],
      id: 'test_message',
      mention_everyone: false,
      mention_roles: [],
      mentions: [],
      pinned: false,
      timestamp: 'ts',
      tts: false,
      type: MessageTypes.DEFAULT
    }, this.client)

    this.messages.add(message)

    return message
  }
}
