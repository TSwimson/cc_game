pallet = {};

basicCell = function(x, y, alive){
  this.pos = [x,y];
  this.alive = alive;
  this.$el = $("<td class='cell'></td>");
  var _this = this;
  this.$el.on('click', $.proxy(this.click, this));
};

basicCell.prototype.click = function() {
  this.alive = !this.alive;
  if (this.alive) {
    this.$el.addClass('alive');
  } else {
    this.$el.removeClass('alive');
  }
};

pallet.init = function () {
  pallet.initGrid(10);
};

pallet.initGrid = function (s) {
  var tableBody = $('#palletTableBody');
  pallet.cells = [];
  for (var x = 0; x < s; x += 1) {
    pallet.cells.push([]);
    var row = $('<tr></tr>');
    for (var y = 0; y < s; y += 1) {
       pallet.cells[x].push(new basicCell(x,y,false));
       row.append(pallet.cells[x][y].$el);
    }
    tableBody.append(row);
  }
};
$(function(){
  pallet.init();
});