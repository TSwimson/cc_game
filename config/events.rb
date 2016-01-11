WebsocketRails::EventMap.describe do
  namespace :websocket_rails do
    subscribe :subscribe_private, to: ChannelController, :with_method => :authorize_channels

  end
  subscribe :client_disconnected, to: ChannelController, :with_method => :player_disconnected
  subscribe :find_opponent, to: MatchingController, :with_method => :find_opponent
  subscribe :join_game, to: MatchingController, :with_method => :join_game
  subscribe :submit_turn, to: GameController, :with_method => :submit_turn

  subscribe :get_replays, to: ReplayController, with_method: :get_replays
  subscribe :select_replay, to: ReplayController, with_method: :select_replay
  subscribe :get_next_replay_turn, to: ReplayController, with_method: :get_next_replay_turn
end
