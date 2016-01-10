# == Schema Information
#
# Table name: games
#
#  id         :integer          not null, primary key
#  round      :integer
#  status     :string(255)
#  created_at :datetime
#  updated_at :datetime
#

class Game < ActiveRecord::Base
  has_many :players
end
