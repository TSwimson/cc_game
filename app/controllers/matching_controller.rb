# handles players that are looking for matches
# and matching them and creating a game for them
class MatchingController < WebsocketRails::BaseController
  # Set the players status to looking
  # if there is an opponent set their statuses to the opponents id's
  # trigger the opponent_found for both players
  # make sure their game id's are nil because they must not be in a game if their status is not 'ingame'
  def find_opponent
    opponent = get_looking_player(current_user.id)
    if opponent
      current_user.player.status = opponent.user.id.to_s
      opponent.status = current_user.id.to_s
      opponent.user.save
      current_user.player.save
      WebsocketRails["user#{current_user.id}"].trigger('opponent_found', opponent.to_json)
      WebsocketRails["user#{opponent.id}"].trigger('opponent_found', current_user.player.to_json)
    else
      current_user.player.status = 'looking'
      current_user.player.save
    end
  end

  # check if both players statuses are thier opponents id's
  # check if the game already exists
  # if it does then mark the game as started
  # if it doesn't create it and add both players
  def join_game
    player_one_user = User.find(message[:player_one_id])
    player_one = player_one_user.player
    player_two_user = User.find(message[:player_two_id])
    player_two = player_two_user.player

    player_two_available = (player_two.status == 'looking' || player_two.status.to_i == player_one.id)
    player_one_available = (player_one.status == 'looking' || player_one.status.to_i == player_two.id)

    if player_two_available && player_one_available
      if player_two.game_id == player_one.game_id && player_one.game_id != nil && player_one.game.round == 0 && player_one.game.status == 'starting'
        game = player_one.game
        player_one.status = 'ingame'
        player_two.status = 'ingame'
        player_one.save
        player_two.save
        game.update_attributes(status: "started")
        WebsocketRails["user#{player_one_user.id}"].trigger('entered_game', game.to_json)
        WebsocketRails["user#{player_two_user.id}"].trigger('entered_game', game.to_json)
      else
        game = Game.create(round: 0, status: 'starting')
        player_one.game_id = game.id
        player_two.game_id = game.id

        player_one.save
        player_two.save
        trigger_success
      end
    else # something went wrong try joining with a different player
      trigger_failure
    end
  end

  private

  def get_looking_player(id)
    player = Player.where(status: id.to_s).first
    player = player || Player.where(status: 'looking').where('user_id != ?', id).first
  end
end
