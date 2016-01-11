playerSetup = {};

//connects to this users private channel
playerSetup.join_user_channel = function() {
  //var server = '54.186.18.21:80/websocket';
  var server = 'localhost:3000/websocket';
  playerSetup.dispatcher = new WebSocketRails(server);
  playerSetup.user_channel = playerSetup.dispatcher.subscribe_private('user' + $('#current_user').data('userId'));
  playerSetup.user_channel.on_success = function(current_user) {
    playerSetup.current_user = current_user;
  };
};
//sets players status to looking and subscribes to the found opponent event
playerSetup.find_match = function() {
  $('#find_opponent').remove();
  $('#finding_opponent').html('Looking For Player');
  var object = {};
  playerSetup.dispatcher.trigger('find_opponent', object);

  playerSetup.user_channel.bind('opponent_found', function(data){
    $('#finding_opponent').remove();
    playerSetup.opponent = JSON.parse(data);
    playerSetup.enter_game();
  });
};

playerSetup.enter_game = function(){
  playerSetup.user_channel.bind('entered_game', function(data){
    playerSetup.game = JSON.parse(data);
    gameWrapper.start_game();
  });
  var game = {};
  game.player_one_id = playerSetup.current_user.id;
  game.player_two_id = playerSetup.opponent.id;
  playerSetup.dispatcher.trigger('join_game', game);
};

$(function(){
  if (typeof(playerSetup.user_channel) === 'undefined'){
    playerSetup.join_user_channel();
  }
  $('body').on('click', '.find_match', playerSetup.find_match);
  $('body').on('click', '.list_replays', replayWrapper.init);
});
