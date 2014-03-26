gameWrapper = {};

gameWrapper.start_game = function() {
  gameWrapper.nextMoves = [];

  gameWrapper.grid = new Grid(40,40);
  gameWrapper.round_one = true;
  gameWrapper.channel = playerSetup.dispatcher.subscribe_private('game' + playerSetup.game.id);
  gameWrapper.channel.on_success = function(data){
    console.log('Joined game channel. Data: ' + data);
  };

  gameWrapper.channel.on_failure = function(data){
    console.log('couldnt join game channel. Data: ' + data);
  };

  playerSetup.user_channel.bind('next_turn', function(data){
    console.log('next turn triggered data : ' + data);
    moves = JSON.parse(data);
    moves = moves[playerSetup.opponent.id];
    for (var i in moves) {
      gameWrapper.grid.click(moves[i][0],moves[i][1]);
    }
    for(i = 0; i < 10; i++){
      setTimeout(function(){gameWrapper.grid.update.apply(gameWrapper.grid);},200*i);
    }
  });

  if (playerSetup.opponent.id > playerSetup.current_user.id) {
    gameWrapper.player = {};
    gameWrapper.opponent = {};
    gameWrapper.player.number = "one";
    gameWrapper.opponent.number = "two";

  } else {
    gameWrapper.player = {};
    gameWrapper.opponent = {};
    gameWrapper.player.number = "two";
    gameWrapper.opponent.number = "one";
  }
  gameWrapper.player.cells = 4;
  gameWrapper.opponent.cells = 4;

  $('#gameButtons').html("<button type='button' id='endTurn'>End Turn</button>");
  gameWrapper.updateCellCount();
  gameWrapper.endGame = false;
  $('#endTurn').on('click', function(event){
    console.log('submitting turn');
    if (gameWrapper.round_one){
      gameWrapper.round_one = false;
    }
    playerSetup.dispatcher.trigger('submit_turn', { moves: gameWrapper.nextMoves });
    gameWrapper.nextMoves = [];
    gameWrapper.player.cells += 10;
    gameWrapper.opponent.cells += 10;
    gameWrapper.updateCellCount();
    if (gameWrapper.endGame) {
      alert("player " + gameWrapper.loser +  ' lost!');
    }
  });
};

gameWrapper.updateCellCount = function(){
  $('#playerCells').html("<p>Your Cell Count: " + gameWrapper.player.cells + "</p>");
};

var GAME = {
  width: 400,
  height: 400,
  cell: {
    width: 5,
    height: 5,
    padding: 1,
    aliveColor: 'black',
    deadColor: 'grey'
  },
  players: {
    one: {
      cell: {
        aliveColor: '#900'
      }
    },
    two: {
      cell: {
        aliveColor: '#090'
      }
    },
    three: {
      cell: {
        aliveColor: '#009'
      }
    },
    four: {
      cell: {
        aliveColor: '#909'
      }
    }
  }
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
  this.$el.on('click', function(event){_this.click(_this, event);});
};

Cell.prototype.click = function(_this, event) {
  if(_this.territory === gameWrapper.player.number && gameWrapper.player.cells > 0 && !_this.alive) {
    _this.alive = !_this.alive;
    _this.player = gameWrapper.player.number;
    _this.nextPlayer = gameWrapper.player.number;
    _this.update();
    gameWrapper.nextMoves.push(this.pos);
    gameWrapper.player.cells -= 1;
    if (gameWrapper.round_one) {
      _this.lifeBlock = true;
    }
    gameWrapper.updateCellCount();
  }
};

Cell.prototype.computer_click = function() {
  if (this.territory === gameWrapper.opponent.number && gameWrapper.opponent.cells > 0 && !this.alive) {
    this.alive = !this.alive;
    this.player = gameWrapper.opponent.number;
    this.nextPlayer = gameWrapper.opponent.number;
    this.update();
    gameWrapper.opponent.cells -= 1;
    if (gameWrapper.round_one) {
      this.lifeBlock = true;
    }
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

Grid.prototype.click = function(x,y) {
  this.cells[x][y].computer_click();
};
