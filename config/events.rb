WebsocketRails::EventMap.describe do
  namespace :websocket_rails do
    subscribe :subscribe_private, to: AuthorizationController, :with_method => :authorize_channels

  end
  subscribe :client_disconnected, to: AuthorizationController, :with_method => :player_disconnected
  subscribe :find_opponent, to: AuthorizationController, :with_method => :find_opponent
  subscribe :join_game, to: AuthorizationController, :with_method => :join_game
  subscribe :submit_turn, to: AuthorizationController, :with_method => :submit_turn
end
