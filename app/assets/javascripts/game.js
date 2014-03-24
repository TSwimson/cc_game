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
var Cell = function (alive, x, y) {
  this.alive = alive;
  this.player = '';
  this.nextPlayer = '';
  this.rect = new fabric.Rect({
    left: (GAME.cell.width + 1) * x,
    top: (GAME.cell.height + 1) * y,
    fill: GAME.cell.deadColor,
    width: GAME.cell.width,
    height: GAME.cell.height,
    selectable: false,
  });
};

Cell.prototype.click = function(p) {
  this.alive = !this.alive;
  this.player = p;
  this.nextPlayer = p;
  this.update();
};

Cell.prototype.update = function(){
  if (this.alive) {
    if (this.player === '') {
      this.rect.set('fill', GAME.cell.aliveColor);
    } else {
      this.rect.set('fill', GAME.players[this.player].cell.aliveColor);
    }
  }
  else {
    this.rect.set('fill', GAME.cell.deadColor);
  }
};

//Grid definition
var Grid = function(w, h, c) {
  this.initGrid(w,h, c);
};

Grid.prototype.initGrid = function(w, h, canvas) {
  this.cells = [];
  for (var x = 0; x < w; x++) {
    this.cells[x] = [];
    for (var y = 0; y < h; y++) {
      this.cells[x].push(new Cell(false, x, y));
      canvas.add(this.cells[x][y].rect);
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
          if (playerCounts[p] > 2) {
            this.cells[x][y].nextPlayer = p;
          }
        }
      }
      this.cells[x][y].nextAlive = result;

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

Grid.prototype.click = function(options, p) {
  var x = options.target.left / (GAME.cell.width + GAME.cell.padding);
  var y = options.target.top / (GAME.cell.height + GAME.cell.padding);
  this.cells[x][y].click(p);
};

$(function(){
  var canvas = new fabric.Canvas('c');
  canvas.selection = false;
  var grid = new Grid(20,20,canvas);
  window.grid = grid;
  var player = '';

  canvas.on('mouse:down', function(options){
    if (options.target !== undefined) {
      grid.click(options, player);
    } else {
      grid.update();
    }
  });
  
  $('body').on('keydown', function(event){
    if (event.keyCode === 79) {
      player = 'one';
    } else if (event.keyCode === 84 ) {
      player = 'two';
    } else {
      player = '';
    }
  });

});







