pallet = {};
var simpleGrid = function(s, cells, name){
  var className = name.split(' ').join('_');
  var context = {className: className, name: name};
  var html = HandlebarsTemplates.structure(context);
  $('#structures').append(html);
  var tableBody = $('.' + className);
  this.cells = [];
  for (var x = 0; x < s; x += 1) {
    this.cells.push([]);
    var row = $('<tr></tr>');
    for (var y = 0; y < s; y += 1) {
       this.cells[x].push(new basicCell(x,y,cells[x][y], true));
       row.append(this.cells[x][y].$el);
    }
    tableBody.append(row);
  }
};

basicCell = function(x, y, alive, noEvents){
  this.pos = [x,y];
  this.alive = alive;
  this.$el = $("<td class='cell'></td>");
  if (this.alive) {
    this.$el.addClass('alive');
  }
  var _this = this;
  if (typeof(noEvents) === 'undefined' || noEvents === false) {
    this.$el.on('click', $.proxy(this.click, this));
  }
};

basicCell.prototype.click = function() {
  this.alive = !this.alive;
  if (this.alive) {
    this.$el.addClass('alive');
  } else {
    this.$el.removeClass('alive');
  }
  if (pallet.cursor) {
    $('#cursor').html($('#palletTable').clone());
  }
};

pallet.init = function () {
  var html = HandlebarsTemplates.pallet();
  $('#palletDiv').html(html);

  pallet.initGrid(10);
  var glider = new simpleGrid(10, pallet.glider, 'Glider');
  var ship = new simpleGrid(10, pallet.lwss, 'Space Ship');
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

pallet.glider = [[false, false, false, false, false, false, false, false, false, false,],
                 [false, false, false, false, false, false, false, false, false, false,],
                 [false, false, false, false, false, false, false, false, false, false,],
                 [false, false, false, true, true, true, false, false, false, false,],
                 [false, false, false, true, false, false, false, false, false, false,],
                 [false, false, false, false, true, false, false, false, false, false,],
                 [false, false, false, false, false, false, false, false, false, false,],
                 [false, false, false, false, false, false, false, false, false, false,],
                 [false, false, false, false, false, false, false, false, false, false,],
                 [false, false, false, false, false, false, false, false, false, false,],
                 [false, false, false, false, false, false, false, false, false, false,]];

pallet.lwss = [[false, false, false, false, false, false, false, false, false, false,],
               [false, false, false, false, false, false, false, false, false, false,],
               [false, false, false, false, false, false, false, false, false, false,],
               [false, false, false, true, true, true, true, false, false, false,],
               [false, false, true, false, false, false, true, false, false, false,],
               [false, false, false, false, false, false, true, false, false, false,],
               [false, false, true, false, false, true, false, false, false, false,],
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