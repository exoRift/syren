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
  ClientApplication,
  type User,
  type RawTextChannel,
  type RawGuild,
  Shard,
  type RawGuildChannel,
  ExtendedUser,
  type RawOAuthUser,
  type CreateMessageOptions,
  type Message,
  type AnyTextableChannel
} from 'oceanic.js'

import { TextChannel } from './structures/TextChannel'

export class Client extends OceanicClient {
  syren = {
    client: this as OceanicClient,
    application: new ClientApplication({
      id: 'application',
      flags: 0
    }, this as OceanicClient),
    shard: new Shard(0, this as OceanicClient),
    selfUserRaw: {
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
    } satisfies RawOAuthUser,

    guilds: new Map<string, Guild>(),
    textChannels: new Map<string, TextChannel>(),
    users: new Map<string, User>(),

    async connect (): Promise<void> {
      this.client.shards.set(this.shard.id, this.shard)
      this.client.users.add(this.client.user)

      this.shard.emit('ready')
      this.client.emit('ready')
    },

    createGuild (input?: Partial<RawGuild>): Guild {
      const id = input?.id ?? Date.now().toString()

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
        members: [], // TODO: add self as member
        mfa_level: MFALevels.NONE,
        name: 'default guild name',
        nsfw_level: GuildNSFWLevels.DEFAULT,
        owner_id: this.client.user.id, // TODO: construct self
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
    },

    createGuildTextChannel (input?: Partial<RawTextChannel>): TextChannel {
      const guildId = input?.guild_id ?? Date.now().toString()
      const id = input?.id ?? (Date.now() + 1).toString() // Ensure IDs don't match

      if (!this.client.channelGuildMap[guildId]) {
        console.warn('[SYREN]', 'Created a guild text channel without a guild. Creating a default guild...')

        this.createGuild({ id: guildId })
      }

      const data: RawTextChannel = {
        type: ChannelTypes.GUILD_TEXT,
        id,
        guild_id: guildId,
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
    },

    createUser () {

    },

    async sendMessage (channel: AnyTextableChannel, options: CreateMessageOptions): Promise<Message> {
      const message = await channel.createMessage(options)

      this.client.emit('messageCreate', message)

      return message
    }/* ,

    callCommand (): void {
      const interaction = new CommandInteraction({
        application_id: this.application.id,
        channel_id: this.fakeChannel.id,
        data: {
          id: 'test_command',
          name: 'command',
          type: ApplicationCommandTypes.CHAT_INPUT,
          guild_id: this.fakeGuild.id
        },
        user: this._fakeUserRaw,
        id: 'test_command',
        token: 'test_token',
        type: InteractionTypes.APPLICATION_COMMAND,
        version: 1
      }, this)

      this.emit('interactionCreate', interaction)
    } */
  }

  private readonly _self = new ExtendedUser(this.syren.selfUserRaw, this)

  get application (): ClientApplication {
    return this.syren.application
  }

  get user (): ExtendedUser {
    return this._self
  }

  // getChannel<T extends AnyChannel = AnyChannel> (id: string): T | undefined {
  //   return this.syren.textChannels.get(id) as T | undefined
  // }
}
