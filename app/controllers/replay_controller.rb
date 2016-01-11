class ReplayController < WebsocketRails::BaseController

  def get_replays
    replays = Game.replays.as_json(include: [:player_1, :player_2])
    replays.each do |replay|
      replay['updated_at'] = replay['updated_at'].in_time_zone('Pacific Time (US & Canada)').strftime('%b/%d/%y %l:%M %p')
    end
    WebsocketRails[current_user.channel].trigger('replay_list', replays)
  end

  def select_replay
    game = Game.find(message[:game_id])
    current_user.player.update_attributes(game_id: game.id)
    WebsocketRails[current_user.channel].trigger('first_replay_turn', { player_1: game.player_1.as_json, player_2: game.player_2.as_json, moves: game.moves_for_round(0) })
  end

  def get_next_replay_turn
    game = current_user.game
    WebsocketRails[current_user.channel].trigger('next_replay_turn', game.moves_for_round(message[:round].to_i))

  end
end
