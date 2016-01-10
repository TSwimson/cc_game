# == Schema Information
#
# Table name: players
#
#  id         :integer          not null, primary key
#  name       :string(255)
#  status     :string(255)
#  game_id    :integer
#  user_id    :integer
#  created_at :datetime
#  updated_at :datetime
#

class Player < ActiveRecord::Base
  belongs_to :user
  belongs_to :game
  has_many :moves, through: :user
end
