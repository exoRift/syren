import {
  Client as OceanicClient,
  ChannelTypes,
  Guild,
  DefaultMessageNotificationLevels,
  ExplicitContentFilterLevels,
  MFALevels,
  GuildNSFWLevels,
  PremiumTiers,
  VerificationLevels,
  ClientApplication, User,
  type RawTextChannel,
  type RawGuild,
  Shard,
  ExtendedUser,
  type RawOAuthUser,
  type CreateMessageOptions,
  CommandInteraction,
  type RawApplicationCommandInteraction,
  type CreateApplicationCommandOptions,
  ApplicationCommand,
  type RawApplicationCommand,
  type CreateChatInputApplicationCommandOptions,
  type InteractionOptions,
  InteractionTypes,
  type RawMember,
  type TextChannel as OTextChannel,
  type RawUser
} from 'oceanic.js'

import { TextChannel } from './structures/TextChannel'
import { type Message } from './structures/Message'

export class Syren {
  client: Client
  application: ClientApplication
  shard: Shard
  selfUserRaw: RawOAuthUser = {
    avatar: null,
    discriminator: '0',
    id: Date.now().toString(),
    username: 'syrenself',
    flags: 0,
    public_flags: 0,
    email: null,
    mfa_enabled: false,
    verified: false,
    accent_color: null,
    banner: null,
    locale: 'en-us'
  }

  guilds = new Map<string, Guild>()
  textChannels = new Map<string, TextChannel>()
  users = new Map<string, User>()
  commands: ApplicationCommand[] = []

  constructor (client: Client) {
    this.client = client

    this.application = new ClientApplication({
      id: 'application',
      flags: 0
    }, client)

    this.shard = new Shard(0, client)
  }

  /**
   * "Connect" to the Discord API
   */
  async connect (): Promise<void> {
    this.client.shards.set(this.shard.id, this.shard)
    this.client.users.add(this.client.user)

    this.shard.emit('ready')
    this.client.emit('ready')
  }

  /**
   * Create a guild
   * @param   input The guild data
   * @returns       The resulting guild obj
   * @todo          Create the default role
   */
  createGuild (input?: Partial<RawGuild>): Guild {
    const id = input?.id ?? Date.now().toString()

    const selfMember: RawMember = {
      user: this.selfUserRaw,
      deaf: false,
      joined_at: Date.now().toString(),
      mute: false,
      roles: [id] // Default role
    }

    const defaultChannelRaw: RawTextChannel = {
      guild_id: id,
      id,
      name: 'default-channel-name',
      parent_id: null,
      type: ChannelTypes.GUILD_TEXT,
      default_auto_archive_duration: 60,
      last_message_id: null,
      last_pin_timestamp: null,
      nsfw: false,
      permission_overwrites: [],
      position: 0,
      rate_limit_per_user: 0,
      topic: 'topic'
    }

    const data: RawGuild = {
      afk_channel_id: null,
      afk_timeout: 1000,
      application_id: this.application.id,
      banner: null,
      channels: [],
      default_message_notifications: DefaultMessageNotificationLevels.NO_MESSAGES,
      description: 'default guild description',
      discovery_splash: null,
      emojis: [],
      explicit_content_filter: ExplicitContentFilterLevels.DISABLED,
      features: [],
      guild_scheduled_events: [],
      icon: null,
      id,
      joined_at: Date.now().toString(),
      large: false,
      member_count: 1,
      members: [selfMember],
      mfa_level: MFALevels.NONE,
      name: 'default guild name',
      nsfw_level: GuildNSFWLevels.DEFAULT,
      owner_id: this.client.user.id,
      preferred_locale: 'en-us',
      premium_progress_bar_enabled: false,
      premium_tier: PremiumTiers.NONE,
      presences: [],
      public_updates_channel_id: null,
      roles: [],
      rules_channel_id: null,
      safety_alerts_channel_id: null,
      splash: null,
      stage_instances: [],
      system_channel_flags: 0,
      system_channel_id: null,
      threads: [],
      vanity_url_code: null,
      verification_level: VerificationLevels.NONE,
      voice_states: [],
      ...input
    }

    const guild = new Guild(data, this.client)
    const defaultChannel = new TextChannel(defaultChannelRaw, this.client)

    guild.channels.add(defaultChannel)
    this.client.channelGuildMap[defaultChannel.id] = guild.id

    this.guilds.set(guild.id, guild)
    this.client.guilds.add(guild)

    return guild
  }

  /**
   * Create a guild text channel
   * @param   input The channel data
   * @returns       The resulting channel obj
   */
  createGuildTextChannel (input?: Partial<RawTextChannel>): TextChannel {
    const guildID = input?.guild_id ?? Date.now().toString()
    const id = input?.id ?? (Date.now() + 1).toString() // Ensure IDs don't match

    if (!this.client.channelGuildMap[guildID]) {
      console.warn('[SYREN]', 'Created a guild text channel without a guild. Creating a default guild...')

      this.createGuild({ id: guildID })
    }

    const data: RawTextChannel = {
      type: ChannelTypes.GUILD_TEXT,
      id,
      guild_id: guildID,
      default_auto_archive_duration: 60,
      last_message_id: null,
      last_pin_timestamp: null,
      name: 'default-channel-name',
      nsfw: false,
      parent_id: null,
      permission_overwrites: [],
      position: 0,
      rate_limit_per_user: 0,
      topic: null,
      ...input
    }

    const channel = new TextChannel(data, this.client)

    this.textChannels.set(channel.id, channel)
    this.client.channelGuildMap[channel.id] = channel.guildID

    return channel
  }

  createUser (input?: Partial<RawUser>): User {
    const data: RawUser = {
      id: Date.now().toString(),
      avatar: null,
      discriminator: '0',
      public_flags: 0,
      username: 'default user name',
      ...input
    }

    const user = new User(data, this.client)

    this.users.set(user.id, user)

    return user
  }

  /**
   * Send a message as a user
   * @param   channel The channel to send the message in
   * @param   options The message options
   * @param   author  The user who authored this message
   * @returns         The resulting message obj
   */
  async sendMessage (channel: TextChannel, options: CreateMessageOptions, author?: User): Promise<Message<OTextChannel>> {
    const message = await channel.createMessage(options, author)

    this.client.emit('messageCreate', message)

    return message
  }

  /**
   * Add a reaction to a message
   * NOTE: This will not work with custom emojis (Emit the event yourself if needed)
   * @param message The message to react to
   * @param emoji   The emoji to react with
   * @param user    The user who added the reaction
   */
  async addReaction (message: Message, emoji: string, user?: User): Promise<void> {
    await message.createReaction(emoji, user)

    this.client.emit('messageReactionAdd', message, user ?? this.client.user, {
      id: null,
      name: emoji,
      animated: false
    })
  }

  /**
   * Remove a reaction from a message
   * NOTE: This will not work with custom emojis (Emit the event yourself if needed)
   * @param message The message to remove the reaction from
   * @param emoji   The emoji to remove
   * @param user    The whom the reaction belonged to
   */
  async removeReaction (message: Message, emoji: string, user?: User): Promise<void> {
    await message.deleteReaction(emoji, user?.id ?? this.client.user.id)

    this.client.emit('messageReactionRemove', message, user ?? this.client.user, {
      id: null,
      name: emoji,
      animated: false
    })
  }

  async removeAllReactions (message: Message, emoji?: string): Promise<void> {
    await message.deleteReactions(emoji)

    if (emoji) {
      this.client.emit('messageReactionRemoveEmoji', message, {
        id: null,
        name: emoji,
        animated: false
      })
    } else this.client.emit('messageReactionRemoveAll', message)
  }

  /**
   * Register a command to be called
   * @param   input The options
   * @returns       The resulting command obj
   */
  registerCommand (input: CreateApplicationCommandOptions): ApplicationCommand {
    const id = Date.now().toString()

    const data: RawApplicationCommand = {
      application_id: this.application.id,
      default_member_permissions: null,
      version: '1',
      id,
      ...input as CreateChatInputApplicationCommandOptions
    }

    const command = new ApplicationCommand(data, this.client)

    this.commands.push(command)

    return command
  }

  /**
   * Run a command
   * @param   channel The channel to run the command in
   * @param   user    The user who ran the command
   * @param   name    The name of the command (errors if not registered prior)
   * @param   options The options supplied to the command
   * @returns         The resulting command obj
   */
  callSlashCommand (channel: TextChannel, user: User, name: string, options?: InteractionOptions[]): CommandInteraction {
    const command = this.commands.find((c) => c.name === name)

    if (!command) throw Error('Tried to call a non-existent command')

    const id = Date.now().toString()

    const data: RawApplicationCommandInteraction = {
      application_id: this.application.id,
      channel_id: channel.id,
      data: {
        id: command.id,
        name,
        type: command.type,
        guild_id: channel.guildID,
        options
      },
      user: this.rawFromUser(user),
      id,
      token: 'FAKE TOKEN',
      type: InteractionTypes.APPLICATION_COMMAND,
      version: 1
    }

    const interaction = new CommandInteraction(data, this.client)

    this.client.emit('interactionCreate', interaction)

    return interaction
  }

  rawFromUser (user: User | RawUser): RawUser {
    return {
      ...user,
      public_flags: user instanceof User ? user.publicFlags : user.public_flags
    }
  }
}

/**
 * An augmented version of the {@link https://docs.oceanic.ws/v1.7.1 Oceanic.JS} client
 */
export class Client extends OceanicClient {
  /**
   * Mocking utilities
   */
  syren = new Syren(this)

  protected readonly _self = new ExtendedUser(this.syren.selfUserRaw, this)

  get application (): ClientApplication {
    return this.syren.application
  }

  get user (): ExtendedUser {
    return this._self
  }
}
