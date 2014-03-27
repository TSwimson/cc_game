pallet = {};

basicCell = function(x, y, alive){
  this.pos = [x,y];
  this.alive = alive;
  this.$el = $("<td class='cell'></td>");
  if (this.alive) {
    this.$el.addClass('alive');
  }
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
  if (pallet.cursor){
    $('#cursor').html($('#palletTable').clone());
  }
};

pallet.init = function () {
  pallet.initGrid(10);
  $('#gameButtons').append("<button id='copy_button' type='button'>Copy</button>");
  $('#gameButtons').append("<button id='clear_pallet' type='button'>Clear</button>");
  $('#gameButtons').append("<button id='flip_y' type='button'><--></button>");
  $('#gameButtons').append("<button id='flip_x' type='button'>^</br>|</br>v</button>");
  $('#copy_button').bind('click', pallet.toggleCursor);
  //$(document).bind('click', pallet.toggleCursor);
  $('#clear_pallet').bind('click', pallet.clear);
  $('#flip_y').bind('click', pallet.flipY);
  $('#flip_x').bind('click', pallet.flipX);
};

pallet.toggleCursor = function() {
  if (pallet.cursor) {
    pallet.disableCursor();
    pallet.cursor = false;
  } else {
    pallet.enableCursor();
    pallet.cursor = true;
  }
};

pallet.enableCursor = function () {
  $('#cursor').show();
  $('#cursor').html($('#palletTable').clone());
  $(document).bind('mousemove', function(e){
    $('#cursor').css({
       left:  e.pageX - 5,
       top:   e.pageY - 5
    });
  });
  $('#copy_button').html('Cancel');
};

pallet.disableCursor = function () {
  $('#cursor').hide();
  $('#copy_button').html('Copy');
  $(document).unbind('mousemove');
};

pallet.clear = function () {
  var len = pallet.cells.length;
  for (var x = 0; x < len; x++) {
    for (var y = 0; y < len; y++) {
      pallet.cells[x][y].alive = false;
      pallet.cells[x][y].$el.removeClass('alive');
    }
  }
  if (pallet.cursor){
    $('#cursor').html($('#palletTable').clone());
  }
};
pallet.flipY = function () {
  var len = pallet.cells.length;
  new_arr = pallet.emptyTenByTen.slice();
  for (var x = 0; x < len; x++) {
    for (var y = 0; y < len; y++) {
      new_arr[x][len - y - 1] = pallet.cells[x][y].alive;
    }
  }
  pallet.initGrid(10, new_arr);
  if (pallet.cursor){
    $('#cursor').html($('#palletTable').clone());
  }
};
pallet.flipX = function () {
  var len = pallet.cells.length;
  new_arr = pallet.emptyTenByTen.slice();
  for (var x = 0; x < len; x++) {
    for (var y = 0; y < len; y++) {
      new_arr[len - x - 1][y] = pallet.cells[x][y].alive;
    }
  }
  pallet.initGrid(10, new_arr);
  if (pallet.cursor){
    $('#cursor').html($('#palletTable').clone());
  }
};

pallet.emptyTenByTen = [[false, false, false, false, false, false, false, false, false, false,],
                       [false, false, false, false, false, false, false, false, false, false,],
                       [false, false, false, false, false, false, false, false, false, false,],
                       [false, false, false, false, false, false, false, false, false, false,],
                       [false, false, false, false, false, false, false, false, false, false,],
                       [false, false, false, false, false, false, false, false, false, false,],
                       [false, false, false, false, false, false, false, false, false, false,],
                       [false, false, false, false, false, false, false, false, false, false,],
                       [false, false, false, false, false, false, false, false, false, false,],
                       [false, false, false, false, false, false, false, false, false, false,],
                       [false, false, false, false, false, false, false, false, false, false,]];

pallet.initGrid = function (s, aliveCells) {
  $('#palletTableBody').html('');
  if (typeof(aliveCells) === 'undefined'){
    aliveCells = pallet.emptyTenByTen;
  }
  var tableBody = $('#palletTableBody');
  pallet.cells = [];
  for (var x = 0; x < s; x += 1) {
    pallet.cells.push([]);
    var row = $('<tr></tr>');
    for (var y = 0; y < s; y += 1) {
       pallet.cells[x].push(new basicCell(x,y,aliveCells[x][y]));
       row.append(pallet.cells[x][y].$el);
    }
    tableBody.append(row);
  }
};