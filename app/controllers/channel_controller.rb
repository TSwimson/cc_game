# handles channel authentication and disconnection
class ChannelController < WebsocketRails::BaseController
  # For alowwing a user to join their private user channel
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
    end
  end

  def player_disconnected
    current_user.player.status = 'offline'
    current_user.game.destroy if current_user.game
    current_user.player.save
  end
end