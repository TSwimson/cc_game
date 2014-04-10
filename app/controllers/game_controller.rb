# Ingame events
class GameController < WebsocketRails::BaseController
  # When a player has submitted their turn
  # add it to the database
  # and if their opponent has submitted thier turn send the end_turn event to the users clients
  def submit_turn
    game = current_user.game
    game = Game.find(game.id)
    player = game.players.where('user_id != ?', current_user.id).first
    Move.create(round: game.round, points: message[:moves].to_json, user_id: current_user.id, game_id: game.id)
    moves = {}
    moves[current_user.id] = message[:moves]
    moves[player.user.id] = Move.where(round: game.round).where(user_id: player.user.id).where(game_id: game.id).first
    if (moves[player.user.id])
      moves[player.user.id] = JSON.parse(moves[player.user.id].points)
      game.round += 1
      game.save
      WebsocketRails["user#{player.user.id}"].trigger('next_turn', moves.to_json)
      WebsocketRails["user#{current_user.id}"].trigger('next_turn', moves.to_json)
    end
  end
end