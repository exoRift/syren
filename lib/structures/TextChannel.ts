import {
  type CreateMessageOptions,
  type RawAttachment,
  TextChannel as OTextChannel,
  MessageTypes,
  type RawMessage,
  type User,
  type RawUser
} from 'oceanic.js'

import { Message } from './Message'
import { type Client } from '../Client'

export class TextChannel extends OTextChannel {
  declare client: Client

  /**
   * @todo Handle other options (such as mentions)
   */
  async createMessage (options: CreateMessageOptions, author?: User | RawUser): Promise<Message<OTextChannel>> {
    const id = this.client.syren._genID()

    const data: RawMessage = {
      attachments: options.attachments?.map((a, i) => ({
        filename: a.filename ?? 'attachment_' + i.toString(),
        id: a.id,
        proxy_url: 'attachment_proxy_url',
        size: 0,
        url: 'attachment_url',
        description: a.description
      } satisfies RawAttachment)).concat(options.files?.map((f, i) => ({
        filename: f.name,
        id: 'file_' + i.toString(),
        proxy_url: 'file_proxy_url',
        size: 0,
        url: 'file_url',
        description: undefined
      } satisfies RawAttachment)) ?? []) ?? [],
      author: author ? this.client.syren._rawFromUser(author) : this.client.syren.selfUserRaw,
      channel_id: this.id,
      content: options.content ?? '',
      edited_timestamp: null,
      embeds: [],
      id,
      mention_everyone: false,
      mention_roles: [],
      mentions: [],
      pinned: false,
      timestamp: id,
      tts: false,
      type: MessageTypes.DEFAULT
    }

    const message = new Message<OTextChannel>(data, this.client)

    this.messages.add(message)

    return message
  }
}
