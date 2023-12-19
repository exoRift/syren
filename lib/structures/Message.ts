import {
  type GetReactionsOptions,
  Message as OMessage,
  type User,
  type AnyTextableChannel,
  type Uncached,
  type RawUser,
  type EditMessageOptions,
  type RawAttachment,
  type CreateMessageOptions,
  type RawUserWithMember,
  type ChannelMention,
  ChannelTypes
} from 'oceanic.js'

import { type Client } from '../Client'
import { type TextChannel } from './TextChannel'

const userMentionMatcher = /<@(.*)>/g
const roleMentionMatcher = /<@&(.*)>/g
const channelMentionMatcher = /<#(.*)>/g

/**
 * @todo Message interactions
 */
export class Message<T extends AnyTextableChannel | Uncached = AnyTextableChannel | Uncached> extends OMessage<T> {
  /**
   * Transform provided attachments and files into raw data for messages
   * @param   options `CreateMessageOptions` or `EditMessageOptions`
   * @returns         The raw data
   */
  static _syrenDigestAttachments (options: CreateMessageOptions | EditMessageOptions): RawAttachment[] {
    return (options.attachments ?? []).map<RawAttachment>((a, i) => ({
      filename: a.filename ?? 'attachment_' + i.toString(),
      id: a.id?.toString() ?? Date.now().toString(),
      proxy_url: 'attachment_proxy_url',
      size: 0,
      url: 'attachment_url',
      description: a.description
    })).concat(options.files?.map((f, i) => ({
      filename: f.name,
      id: 'file_' + i.toString(),
      proxy_url: 'file_proxy_url',
      size: 0,
      url: 'file_url',
      description: undefined
    })) ?? [])
  }

  /** Get role mentions from message content */
  static _syrenGetRoleMentions (options: CreateMessageOptions | EditMessageOptions, channel: TextChannel): string[] {
    // TODO: Filter out invalid roles
    return []
  }

  /** Get user mentions from message content */
  static _syrenGetUserMentions (options: CreateMessageOptions | EditMessageOptions, channel: TextChannel): RawUserWithMember[] {
    // TODO: Filter out invalid users
    const raw = Array.from(options.content?.matchAll(userMentionMatcher) ?? [])

    switch (channel.type) { // TODO: Other channels
      case ChannelTypes.GUILD_TEXT:
        return raw
          .map(([, id]) => channel.guild.members.has(id) ? channel.client.syren._rawFromMember(channel.guild.members.get(id)!) : undefined)
          .filter((v): v is RawUserWithMember => Boolean(v))
    }
  }

  /** Get channel mentions from message content */
  static _syrenGetChannelMentions (options: CreateMessageOptions | EditMessageOptions, channel: TextChannel): ChannelMention[] {
    // TODO: Filter out invalid channels
    const raw = Array.from(options.content?.matchAll(channelMentionMatcher) ?? [])

    switch (channel.type) { // TODO: Other channels
      case ChannelTypes.GUILD_TEXT:
        return raw
          .map(([, id]) => {
            if (channel.guild.channels.has(id)) {
              const existing = channel.guild.channels.get(id)!

              return {
                id,
                guild_id: channel.guild.id,
                name: existing.name,
                type: existing.type as ChannelTypes
              } satisfies ChannelMention
            } else return undefined
          })
          .filter((v): v is ChannelMention => Boolean(v))
    }
  }

  protected _reactions: Record<string, Set<string>> = {}
  declare client: Client

  async createReaction (emoji: string, user?: User | RawUser): Promise<void> {
    const userID = user?.id ?? this.client.user.id
    const isSelf = userID === this.client.user.id

    if (!this._reactions[emoji]) this._reactions[emoji] = new Set()
    const unique = !this._reactions[emoji].has(userID)
    this._reactions[emoji].add(userID)

    const entry = this.reactions.find((r) => r.emoji.name === emoji)

    if (!entry) {
      this.reactions.push({
        emoji: {
          id: emoji,
          name: emoji,
          animated: false
        },
        count: 1,
        me: isSelf,
        burstColors: [],
        countDetails: {
          burst: 0,
          normal: 1
        },
        meBurst: false
      })
    } else if (unique) {
      ++entry.count
      ++entry.countDetails.normal
      entry.me = isSelf
    }
  }

  /**
   * @todo Throw(?) if the bot does not have the permissions
   */
  async deleteReaction (emoji: string, user = this.client.user.id): Promise<void> {
    const isSelf = user === this.client.user.id

    if (this._reactions[emoji]) this._reactions[emoji].delete(user)

    const entry = this.reactions.find((r) => r.emoji.name === emoji)

    if (entry) {
      --entry.count
      entry.me &&= !isSelf
    }
  }

  /**
   * @todo Throw(?) if the bot does not have the permissions
   */
  async deleteReactions (emoji?: string): Promise<void> {
    if (emoji) {
      this._reactions[emoji].clear()

      const entry = this.reactions.find((r) => r.emoji.name === emoji)

      if (entry) {
        entry.count = 0
        entry.me = false
      }
    } else {
      this._reactions = {}
      this.reactions = []
    }
  }

  async getReactions (emoji: string, options: GetReactionsOptions = {}): Promise<User[]> {
    const {
      after,
      limit = 100
    } = options

    const ids = Array.from(this._reactions[emoji] ?? [])

    return ids
      .slice(after ? ids.indexOf(after) : 0, limit)
      .map((id) => this.client.users.get(id))
      .filter((u): u is User => Boolean(u))
  }

  /**
   * @todo Do something with the reason
   * @todo Throw(?) if the bot doesn't have permissions
   */
  async delete (reason?: string): Promise<void> {
    this.channel?.messages.delete(this.id)
  }

  async edit (options: EditMessageOptions): Promise<this> {
    if (this.author.id !== this.client.user.id) throw Error('not your message') // TODO: Get the error message for this

    if (options.content) this.content = options.content // TODO: mentions
    // if (options.attachments ?? options.files) this.attachments = new TypedCollection(Message._syrenDigestAttachments(options), this.client) // TODO: Impl this correctly

    this.editedTimestamp = new Date()

    return this
  }
}
