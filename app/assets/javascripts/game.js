gameWrapper = {};

gameWrapper.start_game = function() {
  gameWrapper.init_vars();

  gameWrapper.setupPlayers();
  gameWrapper.unfreeze();
  var html = HandlebarsTemplates.game({playerOne: gameWrapper.player.data.name, playerTwo: gameWrapper.opponent.data.name});
  $('.gameContainer').append(html);
  gameWrapper.grid = new Grid(40,40);
  pallet.init();

  playerSetup.user_channel.bind('next_turn', gameWrapper.nextTurn);


  $('#endTurn').on('click', function() {
    gameWrapper.endTurn();
  });
  $(document).on('keypress', function(event){
    if (event.which === 13) {
      gameWrapper.endTurn();
    }
  });

  gameWrapper.updateCellCount();
};

gameWrapper.init_vars = function() {
  gameWrapper.nextMoves = [];
  gameWrapper.round_one = true;
  gameWrapper.iterations = 13;
  gameWrapper.endGame = false;
  gameWrapper.replay = false;
  gameWrapper.round = 0;
}

gameWrapper.start_replay = function(data) {
  gameWrapper.init_vars();
  gameWrapper.replay = true;
  gameWrapper.setupPlayers();
  gameWrapper.unfreeze();
  var html = HandlebarsTemplates.game({playerOne: gameWrapper.player.data.name, playerTwo: gameWrapper.opponent.data.name});
  $('.gameContainer').append(html);
  gameWrapper.grid = new Grid(40,40);
  playerSetup.user_channel.bind('next_replay_turn', gameWrapper.nextReplayTurn)
  gameWrapper.nextReplayTurn(data['moves']);
}

gameWrapper.nextTurn = function(data) {
    gameWrapper.round += 1;
    moves = JSON.parse(data);
    moves = moves[playerSetup.opponent.id];
    // gameWrapper.iterations += 1;
    for (var i in moves) {
      gameWrapper.grid.click(moves[i][0],moves[i][1]);
    }
    for(i = 0; i < gameWrapper.iterations; i++) {
      setTimeout(function(){gameWrapper.grid.update.apply(gameWrapper.grid);},200*i);
    }
    gameWrapper.unfreeze();
}

gameWrapper.nextReplayTurn = function(data) {
  // moves = JSON.parse(data);
  var moves = data;
  for ( var player in moves) {
    for (var i in moves[player]) {
      // console.log("clicking: " + moves[player][i][0] + ', ' + moves[player][i][1])
      gameWrapper.grid.click(moves[player][i][0], moves[player][i][1]);
    }
  }
  for(i = 0; i < gameWrapper.iterations; i++) {
    setTimeout(function(){gameWrapper.grid.update.apply(gameWrapper.grid);}, 200*i);
  }
  gameWrapper.getNextReplayTurn();
}

gameWrapper.getNextReplayTurn = function() {
  gameWrapper.round += 1;
  if (gameWrapper.frozen === false) {
    // gameWrapper.freeze();
    if (gameWrapper.round_one){
      gameWrapper.round_one = false;
    }

    gameWrapper.nextMoves = [];
    gameWrapper.player.cells += 10;
    gameWrapper.opponent.cells += 10;
    gameWrapper.updateCellCount();
    if (gameWrapper.endGame) {
      alert("player " + gameWrapper.loser +  ' lost!');
    } else {
      playerSetup.dispatcher.trigger('get_next_replay_turn', {'round': gameWrapper.round});
    }
  }
}

gameWrapper.endTurn = function(){
  if (gameWrapper.frozen === false) {
    gameWrapper.freeze();
    if (gameWrapper.round_one){
      gameWrapper.round_one = false;
    }
    moves = gameWrapper.nextMoves;
    gameWrapper.nextMoves = [];
    gameWrapper.player.cells += 10;
    gameWrapper.opponent.cells += 10;
    gameWrapper.updateCellCount();
    if (gameWrapper.endGame) {
      alert("player " + gameWrapper.loser +  ' lost!');
    }
    console.log('dispatching moves: ' + moves);
    playerSetup.dispatcher.trigger('submit_turn', { moves: moves });
  }
};

gameWrapper.setupPlayers = function(){
  if (playerSetup.opponent.id > playerSetup.current_user.id) {
    gameWrapper.player = {};
    gameWrapper.opponent = {};
    gameWrapper.player.number = "one";
    gameWrapper.player.data = playerSetup.current_user;
    gameWrapper.opponent.data = playerSetup.opponent;
    gameWrapper.opponent.number = "two";

  } else {
    gameWrapper.player = {};
    gameWrapper.opponent = {};
    gameWrapper.player.number = "two";
    gameWrapper.opponent.number = "one";
    gameWrapper.opponent.data = playerSetup.current_user;
    gameWrapper.player.data = playerSetup.opponent;
  }
  gameWrapper.player.cells = 4;
  gameWrapper.opponent.cells = 4;
};
gameWrapper.updateCellCount = function(){
  $('#playerCells').html("<p>" + gameWrapper.player.cells + " cells remaining</p>");
};

gameWrapper.freeze = function(){
  gameWrapper.frozen = true;
  $('#main_container').append("<div class=\'waiting\'><h4>waiting for opponent</h4></div>");
};

gameWrapper.unfreeze = function(){
  gameWrapper.frozen = false;
  $('.waiting').remove();
};

//Cell definition
var Cell = function (alive, x, y, ter) {
  this.alive = alive;
  this.player = '';
  this.nextPlayer = '';
  this.territory = ter;
  this.lifeBlock = false;
  this.pos = [x, y];
  this.$el = $("<td class='cell " + this.territory + "-territory'></td>");
  var _this = this;
  this.$el.on('click', function(){
    if (gameWrapper.frozen === false) {
      if (pallet.cursor){
        $.proxy(_this.stamp(), _this);
      } else {
        $.proxy(_this.click(gameWrapper.player), _this);
      }
    }
  });
};

Cell.prototype.stamp = function(){
  x_offset = this.pos[0];
  y_offset = this.pos[1];
  len = pallet.cells.length;
  for (var x = 0; x < len; x++) {
    for (var y = 0; y < len; y++) {
      if (pallet.cells[x][y].alive) {
        gameWrapper.grid.click(x+x_offset, y+y_offset, gameWrapper.player);
      }
    }
  }
};

Cell.prototype.click = function(player) {
  if(gameWrapper.replay) {
    this.alive = true;
    this.player = this.territory;
    this.nextPlayer = this.territory;
    this.update();
    gameWrapper.nextMoves.push(this.pos);
    player.cells -= 1;
    if (gameWrapper.round_one) {
      this.lifeBlock = true;
    }
    gameWrapper.updateCellCount();
  } else if (this.territory === player.number && player.cells > 0 && !this.alive) {
    this.alive = true;
    this.player = player.number;
    this.nextPlayer = player.number;
    this.update();
    if (gameWrapper.player.number == player.number) {
      gameWrapper.nextMoves.push(this.pos);
    }
    player.cells -= 1;
    if (gameWrapper.round_one) {
      this.lifeBlock = true;
    }
    gameWrapper.updateCellCount();
  }
};

Cell.prototype.update = function(){
  if (this.alive) {
    if (this.player === '') {
      this.$el.addClass('alive');
    } else {
      this.$el.addClass(this.player + '-alive');
    }
  }
  else {
    this.$el.removeClass('alive');
    this.$el.removeClass(this.player + '-alive');
  }
};

//Grid definition
var Grid = function(w, h) {
  this.initGrid(w,h);
};

Grid.prototype.initGrid = function(w, h) {
  this.cells = [];
  var row;
  var ter = "one";
  for (var x = 0; x < w; x++) {
    this.cells[x] = [];
    if (ter === 'one' && x > (h / 2) - h/20){
      ter = '';
    } else if (ter === '' && x > (h / 2)+ h/20) {
      ter = 'two';
    }
    row = $('<tr></tr>');
    $('#gameTableBody').append(row);
    for (var y = 0; y < h; y++) {
      this.cells[x].push(new Cell(false, x, y, ter));
      row.append(this.cells[x][y].$el);
    }
  }
};

Grid.prototype.update = function() {
  for (var x = 0, _xlen = this.cells.length; x < _xlen; x++) {
    for (var y = 0, _ylen = this.cells[x].length; y < _ylen; y++) {
      var counts = this.getNumLivingCellsNearby(x,y);
      var playerCounts = counts[1];
      var count = counts[0];
      var result = false;
      var cell = this.cells[x][y];
      if (cell.alive) {
        if (count < 2) {
          result = false;
        }
        else if (count == 2 || count == 3) {
          result = true;
        }
        else if (count > 3) {
          result = false;
        }
      } else if (count == 3) {
        result = true;
        for (var p in playerCounts) {
          if (playerCounts[p] > 1) {
            this.cells[x][y].nextPlayer = p;
          }
        }
      }
      this.cells[x][y].nextAlive = result;
      if (this.cells[x][y].lifeBlock && result === false) {
        gameWrapper.endGame = true;
        gameWrapper.loser = this.cells[x][y].player;
      }

    }
  }
  for (x = 0, _xlen = this.cells.length; x < _xlen; x++) {
    for (var y = 0, _ylen = this.cells[x].length; y < _ylen; y++) {
      if (!this.cells[x][y].nextAlive && this.cells[x][y].alive) {
        this.cells[x][y].player = '';
      }
      this.cells[x][y].alive = this.cells[x][y].nextAlive;
      this.cells[x][y].player = this.cells[x][y].nextPlayer;
      this.cells[x][y].update();
    }
  }
};
Grid.prototype.getNumLivingCellsNearby = function(x, y) {
  var count = 0;
  var player = {'': 0, one: 0, two: 0, three: 0, four: 0};
  if (y > 0) { //top
    if (x > 0 && (this.cells[x - 1][y - 1].alive)) { //top left
      count++;
      player[this.cells[x - 1][y - 1].player]++;
    }
    if (x < this.cells.length - 1 && (this.cells[x + 1][y - 1].alive)) { //top right
      count++;
      player[this.cells[x + 1][y - 1].player]++;
    }
    if (this.cells[x][y - 1].alive) { //top mid
      count++;
      player[this.cells[x][y - 1].player]++;
    }
  }
  if (y < (this.cells[x].length - 1)) { //bottom
    if (x > 0 && (this.cells[x - 1][y + 1].alive)) { //bottom left
      player[this.cells[x - 1][y + 1].player]++;
      count++;
    }

    if (x < this.cells.length - 1 && (this.cells[x + 1][y + 1].alive)) { //bottom right
      player[this.cells[x + 1][y + 1].player]++;
      count++;
    }
    if ((this.cells[x][y + 1].alive)) { //bottom mid
      player[this.cells[x][y + 1].player]++;
      count++;
    }
  }
  if (x < this.cells.length - 1 && this.cells[x+1][y].alive) {// right mid
    player[this.cells[x+1][y].player]++;
    count++;
  }
  if (x > 0 && this.cells[x - 1][y].alive) { //left mid
    player[this.cells[x - 1][y].player]++;
    count++;
  }
  this.cells[x][y].update();
  return [count, player];
};

Grid.prototype.click = function(x,y,player) {
  if (typeof(player) === 'undefined'){
    player = gameWrapper.opponent;
  }
  this.cells[x][y].click(player);
};
