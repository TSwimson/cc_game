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
