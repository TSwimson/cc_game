gameWrapper = {};

gameWrapper.start_game = function() {
  this.init_vars();

  this.setupPlayers();
  this.unfreeze();
  var html = HandlebarsTemplates.game({playerOne: this.player.data.name, playerTwo: this.opponent.data.name});
  $('.gameContainer').append(html);
  this.grid = new Grid(40,40);
  pallet.init();

  playerSetup.user_channel.bind('next_turn', this.nextTurn.bind(this));


  $('#endTurn').on('click', function() {
    this.endTurn();
  }.bind(this));
  $(document).on('keypress', function(event){
    if (event.which === 13) {
      this.endTurn();
    }
  }.bind(this));

  this.updateCellCount();
};

gameWrapper.init_vars = function() {
  this.nextMoves = [];
  this.round_one = true;
  this.iterations = 13;
  this.endGame = false;
  this.replay = false;
  this.round = 0;
  this.continue_replay = true;
  this.replay_wait_period = 150;
}

gameWrapper.start_replay = function(data) {
  this.init_vars();
  this.replay = true;
  this.setupPlayers();
  this.unfreeze();
  var html = HandlebarsTemplates.game({playerOne: this.player.data.name, playerTwo: this.opponent.data.name});
  $('.gameContainer').append(html);
  this.grid = new Grid(40,40);
  playerSetup.user_channel.bind('replay.next_turn', this.nextReplayTurn.bind(this))
  this.nextReplayTurn(data['moves']);
}

gameWrapper.nextTurn = function(data) {
    this.round += 1;
    moves = JSON.parse(data);
    moves = moves[playerSetup.opponent.id];
    // this.iterations += 1;
    for (var i in moves) {
      this.grid.click(moves[i][0],moves[i][1]);
    }
    for(i = 0; i < this.iterations; i++) {
      setTimeout(this.grid.update.bind(this.grid),200*i);
    }
    this.unfreeze();
}

gameWrapper.nextReplayTurn = function(data) {
  // moves = JSON.parse(data);
  var moves = data;
  for ( var player in moves) {
    for (var i in moves[player]) {
      // console.log("clicking: " + moves[player][i][0] + ', ' + moves[player][i][1])
      this.grid.click(moves[player][i][0], moves[player][i][1]);
    }
  }
  for(i = 0; i < this.iterations; i++) {
    setTimeout(this.grid.update.bind(this.grid), this.replay_wait_period*i);
  }
  if (this.continue_replay) {
    setTimeout(this.getNextReplayTurn.bind(this), this.replay_wait_period*(this.iterations + 1));
  }
}

gameWrapper.getNextReplayTurn = function() {
  this.round += 1;
  if (this.frozen === false) {
    // this.freeze();
    if (this.round_one){
      this.round_one = false;
    }

    this.nextMoves = [];
    this.player.cells += 10;
    this.opponent.cells += 10;
    this.updateCellCount();
    if (this.endGame) {
      alert("player " + this.loser +  ' lost!');
    } else {
      playerSetup.dispatcher.trigger('replay.get_next_turn', {'round': this.round});
    }
  }
}

gameWrapper.endTurn = function(){
  if (this.frozen === false) {
    this.freeze();
    if (this.round_one){
      this.round_one = false;
    }
    moves = this.nextMoves;
    this.nextMoves = [];
    this.player.cells += 10;
    this.opponent.cells += 10;
    this.updateCellCount();
    if (this.endGame) {
      alert("player " + this.loser +  ' lost!');
    }
    console.log('dispatching moves: ' + moves);
    playerSetup.dispatcher.trigger('submit_turn', { moves: moves });
  }
};

gameWrapper.setupPlayers = function(){
  if (playerSetup.opponent.id > playerSetup.current_user.id) {
    this.player = {};
    this.opponent = {};
    this.player.number = "one";
    this.player.data = playerSetup.current_user;
    this.opponent.data = playerSetup.opponent;
    this.opponent.number = "two";
  } else {
    this.player = {};
    this.opponent = {};
    this.player.number = "two";
    this.opponent.number = "one";
    this.opponent.data = playerSetup.current_user;
    this.player.data = playerSetup.opponent;
  }
  this.player.cells = 4;
  this.opponent.cells = 4;
};
gameWrapper.updateCellCount = function(){
  $('#playerCells').html("<p>" + this.player.cells + " cells remaining</p>");
};

gameWrapper.freeze = function(){
  this.frozen = true;
  $('#main_container').append("<div class=\'waiting\'><h4>waiting for opponent</h4></div>");
};

gameWrapper.unfreeze = function(){
  this.frozen = false;
  $('.waiting').remove();
};
