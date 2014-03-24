gameSetup = {};
$(function(){
  $.ajaxSetup({
    headers: {
      'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
    }
  });
});


gameSetup.nameSubmitHandler = function(event) {
  event.preventDefault();
  gameSetup.createPlayer($('#name').val(), gameSetup.playerCreated);
  $('#player_form').remove();
};

gameSetup.createPlayer = function(name, callback) {
  $.ajax({
    method: 'post',
    url: '/players',
    data: {player: {name: name, status: 'looking'}}
  }).done(callback);
};

gameSetup.playerCreated = function(data) {
  $('#welcome').html('Welcome, ' + data.you.name);
  $.cookie('name', data.you.name, {expires: 99});
  $.cookie('id', data.you.id, {expires: 99});
  gameSetup.player = {};
  gameSetup.player.name = data.you.name;
  gameSetup.player.id = data.you.id;
  gameSetup.getOponentWrapper();
};

gameSetup.getOponentWrapper = function(){
  $('oponent').html("looking for players");
  var finding_players_interval = setInterval(function(){gameSetup.getOponent(finding_players_interval);}, 1000);
};

gameSetup.getOponent = function(interval){
  $.ajax({
    method: 'put',
    url: '/players/' + gameSetup.player.id,
    data: {player: {status: 'looking'} } //todo add last message column
  }).done(function(data){
    if (data.player !== 'not found') {
      clearInterval(interval);
      $('#oponent').html('Player found: ' + data.player.name);
      gameSetup.oponent = {};
      gameSetup.oponent.name = data.player.name;
      gameSetup.oponent.id = data.player.id;
      gameSetup.createGame();
    }
  });
};

gameSetup.createGame = function(){
  $.ajax({
    method: 'post',
    url:    '/games',
    data: {player_one: {id: gameSetup.player.id}, player_two: {id: gameSetup.oponent.id}}
  }).done(gameSetup.createdGame);
};

gameSetup.createdGame = function(data){
  if (data.error !== undefined){
    alert("An error occured please try again");
    //TODO better error for when a game wasn't made correctly
  } else if (data.game.status === 'starting'){
    $('#oponent').html($('#oponent').html() + "<p>waiting for player to join</p>");
    gameSetup.game = {};
    gameSetup.game.id = data.game.id;
    gameSetup.checkGameStatusWrapper();
  } else if (data.game.status === 'started') {
    $('#oponent').html($('#oponent').html() + "<p>Player joined! Starting Game</p>");
    //TODO Start the game
  }
};

gameSetup.checkGameStatusWrapper = function(){
  var gameStatusCheckerInterval = setInterval(function(){
    gameSetup.checkGameStatus(gameStatusCheckerInterval);
  }, 500);
};

gameSetup.checkGameStatus = function(interval){
  $.ajax({
      method: 'get',
      url: 'games/' + gameSetup.game.id
    }).done(function(data){
      if (data.error === undefined) {
        clearInterval(interval);
        gameSetup.createdGame(data);
      }
    });
};

$(document).on('submit', '#player_form', gameSetup.nameSubmitHandler);

