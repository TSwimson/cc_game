playerSetup = {};
opdata = {};

//connects to this users private channel
playerSetup.join_user_channel = function() {
  //var server = '54.186.18.21:80/websocket';
  var server = 'localhost:3000/websocket';
  playerSetup.dispatcher = new WebSocketRails(server);
  playerSetup.user_channel = playerSetup.dispatcher.subscribe_private('user' + $('#current_user').data('userId'));
  playerSetup.user_channel.on_success = function(current_user) {
    playerSetup.current_user = current_user;
    console.log('joined a channel as: ' + current_user.name);
  };
  playerSetup.user_channel.on_failure = function(reason){
    console.log("failed : " + reason.message);
  };
};
//sets players status to looking and subscribes to the found opponent event
playerSetup.find_match = function() {
  $('#find_opponent').remove();
  $('#finding_opponent').html('Looking For Player');
  console.log('find_match called');
  var find_success = function(data){
    console.log('find success: ' + data);
  };
  var find_failure = function(data){
    console.log('find failure: ' + data);
  };
  var object = {};
  playerSetup.dispatcher.trigger('find_opponent', object, find_success, find_failure);

  playerSetup.user_channel.bind('opponent_found', function(data){
    //playerSetup.user_channel.unbind('opponent_found');
    $('#finding_opponent').remove();
    console.log("player found: " + data);
    playerSetup.opponent = JSON.parse(data);
    playerSetup.enter_game();
  });
};

playerSetup.enter_game = function(){
  console.log('enter_game js called');
  playerSetup.user_channel.bind('entered_game', function(data){
    console.log("Game created");
    console.log("data " + data);
    playerSetup.game = JSON.parse(data);
    gameWrapper.start_game();
  });
  var game = {};
  game.player_one_id = playerSetup.current_user.id;
  game.player_two_id = playerSetup.opponent.id;
  playerSetup.dispatcher.trigger('join_game', game);
  console.log('enter_game js ended');
};

$(function(){
  if (typeof(playerSetup.user_channel) === 'undefined'){
    playerSetup.join_user_channel();
  }
  $('body').on('click', '.find_match', playerSetup.find_match);
});