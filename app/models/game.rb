# == Schema Information
#
# Table name: games
#
#  id          :integer          not null, primary key
#  round       :integer
#  status      :string(255)
#  created_at  :datetime
#  updated_at  :datetime
#  player_1_id :integer
#  player_2_id :integer
#

class Game < ActiveRecord::Base
  has_many :players
  belongs_to :player_1, class_name: 'Player'
  belongs_to :player_2, class_name: 'Player'
  has_many :moves
  scope :replays, -> { where('games.status = \'ended\' and games.round > 1').eager_load(:player_1, :player_2, :moves).order('games.updated_at DESC').first(5) }

  def moves_for_round(this_round)
    formatted_moves = []
    moves.where(round: this_round).each do |move|
      if(move.user_id == player_1_id)
        formatted_moves[0] = move.points
      else
        formatted_moves[1] = move.points
      end
    end
    formatted_moves
  end
end
