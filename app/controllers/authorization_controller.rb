class AuthorizationController < WebsocketRails::BaseController
  def authorize_channels
    # The channel name will be passed inside the message Hash
    channel = WebsocketRails[message[:channel]]
    channel.make_private
    if message[:channel][0, 4] == 'user'
      if user_signed_in? && "user" + current_user.id.to_s == message[:channel]
        accept_channel current_user.player
      else
        deny_channel({:message => "authorization failed! user_signed_in?: #{user_signed_in?} current_user.id: #{current_user.id.to_s} channel: #{message[:channel]}"})
      end
    elsif message[:channel][0, 4] == 'game'
      if user_signed_in? && current_user.game != nil && message[:channel][4] == current_user.game.id.to_s
        accept_channel({:message => 'connected!'})
      else
        deny_channel({:message => 'authorization failed!'})
      end
    end
  end

  # Set the players status to looking
  def find_opponent
    current_user.player.status = 'looking'
    opponent = get_looking_player(current_user.id)
    if current_user.player.save
      trigger_success({message: 'set status'})
    else
      trigger_failure({message: "something bad happend when trying to save user #{current_user.id} status"})
    end
    if opponent
      current_user.player.status = opponent.user.id.to_s
      opponent.status = current_user.id.to_s
      opponent.user.save
      current_user.player.save
      WebsocketRails["user#{current_user.id}"].trigger('opponent_found', opponent.to_json)
      WebsocketRails["user#{opponent.id}"].trigger('opponent_found', current_user.player.to_json)
    end
  end

  def join_game
    # check if both players are looking
    # check if the game already exists
    # if it does then mark the game as started
    # if it doesn't create it and add both players
    player_one_user = User.find(message[:player_one_id])
    player_one = player_one_user.player
    player_two_user = User.find(message[:player_two_id])
    player_two = player_two_user.player

    player_two_available = (player_two.status == 'looking' || player_two.status.to_i == player_one.id)
    player_one_available = (player_one.status == 'looking' || player_one.status.to_i == player_two.id)

    if player_two_available && player_one_available
      if player_two.game_id == player_one.game_id && player_one.game_id != nil
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
    else # something went wrong try join with a different player
      trigger_failure
    end
  end

  def player_disconnected
    puts '###################################'
    puts '#######USER DISCONNECTED###########'
    puts '###################################'
    puts 'Their id = ' + current_user.id
    current_user.player.status = 'offline'
    current_user.game.destroy if current_user.game
    current_user.player.save
  end

  def submit_turn
    game = current_user.game
    game = Game.find(game.id)
    puts "0 game round = " + game.round.to_s
    puts "0 game id = " + game.id.to_s
    player = game.players.where('user_id != ?', current_user.id).first
    Move.create(round: game.round, points: message[:moves].to_json, user_id: current_user.id, game_id: game.id)
    moves = {}
    moves[current_user.id] = message[:moves]
    moves[player.user.id] = Move.where(round: game.round).where(user_id: player.user.id).where(game_id: game.id).first
    if (moves[player.user.id])
      moves[player.user.id] = JSON.parse(moves[player.user.id].points)
      game.round += 1
      puts "game round = " + game.round.to_s
      puts "game id = " + game.id.to_s
      game.save
      WebsocketRails["user#{player.user.id}"].trigger('next_turn', moves.to_json)
      WebsocketRails["user#{current_user.id}"].trigger('next_turn', moves.to_json)
    end
  end

  private

  def get_looking_player(id)
    player = Player.where(status: id.to_s)[0]
    player = player || Player.where(status: 'looking').where('user_id != ?', id)[0]
  end

end