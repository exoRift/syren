import {
  type GetReactionsOptions,
  Message as OMessage,
  type User,
  type AnyTextableChannel,
  type Uncached
} from 'oceanic.js'

import { type Client } from '../Client'

export class Message<T extends AnyTextableChannel | Uncached = AnyTextableChannel | Uncached> extends OMessage<T> {
  protected _reactions: Record<string, Set<string>> = {}
  declare client: Client

  async createReaction (emoji: string): Promise<void> {
    if (!this._reactions[emoji]) this._reactions[emoji] = new Set()

    this._reactions[emoji].add(this.client.user.id)
    if (!this.reactions[emoji]) {
      this.reactions[emoji] = {
        count: 1,
        me: true
      }
    } else {
      ++this.reactions[emoji].count
      this.reactions[emoji].me = true
    }
  }

  /**
   * @todo Throw(?) if the bot does not have the permissions
   */
  async deleteReaction (emoji: string, user = this.client.user.id): Promise<void> {
    if (this._reactions[emoji]) {
      this._reactions[emoji].delete(user)
    }

    if (this.reactions[emoji]) {
      --this.reactions[emoji].count
      this.reactions[emoji].me = false
    }
  }

  /**
   * @todo Throw(?) if the bot does not have the permissions
   */
  async deleteReactions (emoji?: string): Promise<void> {
    if (emoji) {
      this._reactions[emoji].clear()

      this.reactions[emoji].count = 0
      this.reactions[emoji].me = false
    } else {
      this._reactions = {}
      this.reactions = {}
    }
  }

  async getReactions (emoji: string, options: GetReactionsOptions = {}): Promise<User[]> {
    const {
      after,
      limit = 100
    } = options

    const ids = Array.from(this._reactions[emoji])

    return ids
      .slice(after ? ids.indexOf(after) : 0, limit)
      .map((id) => this.client.users.get(id))
      .filter((u): u is User => Boolean(u))
  }
}
