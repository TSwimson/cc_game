class ReplayController < WebsocketRails::BaseController

  def get_replays
    WebsocketRails[current_user.channel].trigger('replay_list', Game.replays.as_json(include: [:player_1, :player_2]))
  end

  def select_replay
    game = Game.find(message[:game_id])
    current_user.player.update_attributes(game_id: game.id)
    WebsocketRails[current_user.channel].trigger('first_replay_turn', { player_1: game.player_1.as_json, player_2: game.player_2.as_json, moves: game.moves_for_round(0) })
  end

  def get_next_replay_turn
    game = current_user.game
    binding.pry
    WebsocketRails[current_user.channel].trigger('next_replay_turn', game.moves_for_round(message[:round].to_i))

  end
end
