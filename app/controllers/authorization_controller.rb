class AuthorizationController < WebsocketRails::BaseController
  def authorize_channels
    # The channel name will be passed inside the message Hash
    channel = WebsocketRails[message[:channel]]

    if user_signed_in? && "user/" + current_user.id == message[:channel]
      accept_channel current_user.player
    else
      deny_channel({:message => 'authorization failed!'})
    end
  end
end