class GamesController < ApplicationController
  def create # requires something like {player: {id: 1}, player_two: {id: 1}}
    # check if both players are looking
    # check if the game already exists
    # if it does then mark the game as started
    # if it doesn't create it and add both players
    player_one = Player.find(params[:player_one][:id])
    player_two = Player.find(params[:player_two][:id])
    now = Time.now.to_i
    player_two_available = (player_two.status == 'looking' || player_two.status.to_i == player_one.id) && player_two.last_com > now - 3
    player_one_available = (player_one.status == 'looking' || player_one.status.to_i == player_two.id) && player_one.last_com > now - 3
    if player_two_available && player_one_available
      if player_two.game_id == player_one.game_id && player_one.game_id != nil
        game = player_one.game
        player_one.status = 'ingame'
        player_two.status = 'ingame'
        player_one.save
        player_two.save
        game.update_attributes(status: "started")
        render json: { game: game }
      else
        game = Game.create(round: 0, status: 'starting')
        player_one.game_id = game.id
        player_two.game_id = game.id

        player_one.save
        player_two.save

        render json: { game: game }
      end
    else # something went wrong try join with a different player
      render json: { error: "error" }
    end
  end

  def show
    render json: {game: Game.find(params[:id])}
  end
end
