# Ingame events
class GameController < WebsocketRails::BaseController
  # When a player has submitted their turn
  # add it to the database
  # and if their opponent has submitted their turn send the end_turn event to the users clients
  def submit_turn
    game = current_user.game.reload

    player = game.players.where('user_id != ?', current_user.id).first
    Move.create(round: game.round, points: message[:moves], user_id: current_user.id, game_id: game.id)
    moves = {}
    moves[current_user.id] = message[:moves]
    moves[player.user.id] = Move.where(round: game.round).where(user_id: player.user.id).where(game_id: game.id).first
    if (moves[player.user.id])
      moves[player.user.id] = moves[player.user.id].points
      game.round += 1
      game.save
      WebsocketRails["user#{player.user.id}"].trigger('next_turn', moves.to_json)
      WebsocketRails["user#{current_user.id}"].trigger('next_turn', moves.to_json)
    end
  end
end
