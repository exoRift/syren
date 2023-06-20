import {
  type AnyChannel,
  type CreateMessageOptions,
  Client as OceanicClient,
  CommandInteraction,
  ChannelTypes,
  Guild,
  DefaultMessageNotificationLevels,
  ExplicitContentFilterLevels,
  MFALevels,
  GuildNSFWLevels,
  PremiumTiers,
  VerificationLevels,
  ApplicationCommandTypes,
  InteractionTypes,
  ClientApplication,
  User
} from 'oceanic.js'

import { TextChannel } from './structures/TextChannel'

export class Client extends OceanicClient {
  fakeApplication = new ClientApplication({
    id: 'application',
    flags: 0
  }, this)

  fakeChannel = new TextChannel({
    type: ChannelTypes.GUILD_TEXT,
    id: 'test_guild',
    guild_id: 'test_guild',
    default_auto_archive_duration: 60,
    last_message_id: 'test_message',
    last_pin_timestamp: 'ts',
    name: 'test-channel',
    nsfw: false,
    parent_id: 'test_parent',
    permission_overwrites: [],
    position: 0,
    rate_limit_per_user: 0,
    topic: null
  }, this)

  fakeGuild = new Guild({
    afk_channel_id: 'test_channel',
    afk_timeout: 1000,
    application_id: 'test_application',
    banner: 'banner_blob',
    channels: [{
      guild_id: 'test_guild',
      id: 'test_channel',
      name: 'test-channel',
      parent_id: 'test_parent',
      type: ChannelTypes.GUILD_TEXT
    }],
    default_message_notifications: DefaultMessageNotificationLevels.NO_MESSAGES,
    description: 'guild description',
    discovery_splash: 'splash_blob',
    emojis: [],
    explicit_content_filter: ExplicitContentFilterLevels.DISABLED,
    features: [],
    guild_scheduled_events: [],
    icon: 'icon_blob',
    id: 'test_guild',
    joined_at: 'ts',
    large: false,
    member_count: 1,
    members: [],
    mfa_level: MFALevels.NONE,
    name: 'test guild',
    nsfw_level: GuildNSFWLevels.DEFAULT,
    owner_id: 'test_user',
    preferred_locale: 'en-us',
    premium_progress_bar_enabled: false,
    premium_tier: PremiumTiers.NONE,
    presences: [],
    public_updates_channel_id: 'test_channel',
    roles: [],
    rules_channel_id: 'test_channel',
    safety_alerts_channel_id: 'test_channel',
    splash: 'splash_blob',
    stage_instances: [],
    system_channel_flags: 0,
    system_channel_id: 'test_channel',
    threads: [],
    vanity_url_code: 'code',
    verification_level: VerificationLevels.NONE,
    voice_states: []
  }, this)

  _fakeUserRaw = {
    avatar: 'avatar_blob',
    discriminator: '1234',
    id: 'test_user',
    username: 'test user',
    public_flags: 0
  }

  fakeUser = new User(this._fakeUserRaw, this)

  get application (): ClientApplication {
    return this.fakeApplication
  }

  getChannel<T extends AnyChannel = AnyChannel> (id: string): T | undefined {
    return this.fakeChannel as unknown as T
  }

  async sendFakeMessage (options: CreateMessageOptions): Promise<void> {
    const message = await this.fakeChannel.createMessage(options)

    this.emit('messageCreate', message)
  }

  sendFakeInteraction (): void {
    const interaction = new CommandInteraction({
      application_id: 'test_application',
      data: {
        id: 'test_command',
        name: 'command',
        type: ApplicationCommandTypes.CHAT_INPUT,
        guild_id: 'test_guild'
      },
      user: this._fakeUserRaw,
      id: 'test_command',
      token: 'test_token',
      type: InteractionTypes.APPLICATION_COMMAND,
      version: 1
    }, this)

    this.emit('interactionCreate', interaction)
  }
}
