class PlayersController < ApplicationController
  def index
    render json: { players: Players.all.where(status: 'looking'), only: [:id, :name] }
  end

  def create
    player = Player.create(params.require(:player).permit(:name, :status))
    render json: { you: player, only: [:id, :name] }
  end

  def update
    player = Player.find(params[:id])
    player.update_attributes(params.require(:player).permit(:name, :status))
    player.update_attributes(last_com: Time.now.to_i)
    player_two = get_looking_player
    if player_two
      player.update_attributes(status: player_two.id)
      player.save
      render json: { you: player, only: [:id, :name], player: player_two, only: [:id, :name] }
    else
      render json: { you: player, only: [:id, :name], player: 'not found' }
    end
  end

  private

  def get_looking_player
    player = Player.where(status: params[:id])[0]
    player = player || Player.where(status: 'looking').where('id != ?', params[:id]).where('last_com > ?', (Time.now.to_i - 2))[0]
  end
end
