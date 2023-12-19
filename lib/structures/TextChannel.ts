import {
  type CreateMessageOptions,
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

    // TODO: Components
    // TODO: Flags
    // TODO: Message reference

    const data: RawMessage = {
      attachments: Message._syrenDigestAttachments(options),
      author: author ? this.client.syren._rawFromUser(author) : this.client.syren.selfUserRaw,
      channel_id: this.id,
      content: options.content ?? '',
      edited_timestamp: null,
      embeds: options.embeds ?? [],
      id,
      mention_everyone: Boolean(options.content?.includes('@everyone')), // TODO: And has the mention everyone permission
      mentions: Message._syrenGetUserMentions(options, this),
      mention_roles: Message._syrenGetRoleMentions(options, this),
      mention_channels: Message._syrenGetChannelMentions(options, this),
      pinned: false, // TODO: Allow pinning
      timestamp: new Date().toISOString(),
      tts: options.tts ?? false,
      type: MessageTypes.DEFAULT
    }

    const message = new Message<OTextChannel>(data, this.client)

    this.messages.add(message)

    return message
  }
}
