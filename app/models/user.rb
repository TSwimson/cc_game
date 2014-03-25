class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  has_one :player
  has_one :game, through: :player
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  after_create :create_player

  def create_player
    self.player = Player.create(name: SecureRandom.urlsafe_base64(20))
  end

end
