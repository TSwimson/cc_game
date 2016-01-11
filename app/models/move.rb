# == Schema Information
#
# Table name: moves
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  game_id    :integer
#  points     :text
#  round      :integer
#  created_at :datetime
#  updated_at :datetime
#

class Move < ActiveRecord::Base
  belongs_to :user
  belongs_to :game

  serialize :points, JSON
end
