class AuthorizationController < WebsocketRails::BaseController
  def authorize_channels
    # The channel name will be passed inside the message Hash
    channel = WebsocketRails[message[:channel]]

    if user_signed_in? && current_user.email == message[:channel]
      accept_channel current_user.player
    else
      deny_channel({:message => 'authorization failed!'})
    end
  end
end