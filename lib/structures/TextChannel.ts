import {
  type CreateMessageOptions,
  type RawAttachment,
  TextChannel as OTextChannel,
  Message,
  MessageTypes
} from 'oceanic.js'

import { type Client } from '../Client'

export class TextChannel extends OTextChannel {
  client!: Client

  async createMessage (options: CreateMessageOptions): Promise<Message<OTextChannel>> {
    const message = new Message<TextChannel>({
      attachments: options.attachments?.map((a) => ({
        filename: a.filename ?? 'file',
        id: a.id,
        proxy_url: 'test_url',
        size: 0,
        url: 'test_url',
        description: a.description
      } satisfies RawAttachment)).concat(options.files?.map((f) => ({
        filename: f.name,
        id: 'raw_file_' + Date.now().toString(),
        proxy_url: 'test_url',
        size: 0,
        url: 'test_url',
        description: undefined
      } satisfies RawAttachment)) ?? []) ?? [],
      author: this.client._fakeUserRaw,
      channel_id: this.id,
      content: options.content ?? '',
      edited_timestamp: 'ts',
      embeds: [],
      id: 'test_message_' + Date.now().toString(),
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
