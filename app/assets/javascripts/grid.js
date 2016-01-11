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
