require_relative '../../spec_helper.rb'
describe 'Event Mapping for Game' do

  describe 'subscribe to private' do

    it 'routes only to AuthorizationController::authorize_channels' do
      expect(create_event('websocket_rails.subscribe_private', nil)).to be_routed_only_to 'Authorization#authorize_channels'
    end

  end

  describe 'client_disconnected' do

    it 'routes only to Authorization#player_disconnected' do
      expect(create_event('client_disconnected', nil)).to be_routed_only_to 'Authorization#player_disconnected'
    end

  end

  describe 'find_opponent' do

    it 'routes only to Authorization#find_opponent' do
      expect(create_event('find_opponent', nil)).to be_routed_only_to 'Authorization#find_opponent'
    end

  end

  describe 'join_game' do

    it 'routes only to Authorization#join_game' do
      expect(create_event('join_game', nil)).to be_routed_only_to 'Authorization#join_game'
    end

  end

  describe 'submit_turn' do

    it 'routes only to Authorization#submit_turn' do
      expect(create_event('submit_turn', nil)).to be_routed_only_to 'Authorization#submit_turn'
    end

  end
end