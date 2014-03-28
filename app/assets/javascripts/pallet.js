pallet = {};
var simpleGrid = function(s, cells, name){
  this.className = name.split(' ').join('_');
  this.name = name;
  this.cellArray = cells;
  var context = {className: this.className, name: name};
  var html = HandlebarsTemplates.structure(context);
  $('#structures').append(html);
  var tableBody = $('.' + this.className);
  this.cells = [];
  for (var x = 0; x < s; x += 1) {
    this.cells.push([]);
    var row = $('<tr></tr>');
    for (var y = 0; y < s; y += 1) {
       this.cells[x].push(new basicCell(x, y, cells[x][y], true));
       row.append(this.cells[x][y].$el);
    }
    tableBody.append(row);
  }
  this.addClickEvent();
};
simpleGrid.prototype.addClickEvent = function() {
  var _this = this;
  $('.' + this.className + "-div").bind('click', function(){
    pallet.initGrid(10, _this.cellArray);
  });
};

basicCell = function(x, y, alive, noEvents){
  this.pos = [x,y];
  this.alive = alive;
  this.$el = $("<td class='cell'></td>");
  if (this.alive === true) {
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
  var html = HandlebarsTemplates.pallet({playerNumber: gameWrapper.player.number});
  $('#palletDiv').html(html);

  pallet.initGrid(10);
  var glider = new simpleGrid(10, pallet.glider, 'Glider');
  var ship = new simpleGrid(10, pallet.lwss, 'Space Ship');
  $('#copy_button').bind('click', pallet.toggleCursor);
  $(document).bind('keydown', function(event){
    switch (event.which) {
      case 27: //ecs
        pallet.disableCursor();
        break;
      case 39: //rightArrow
      case 37: //leftArrow
        pallet.flipY();
        break;
      case 38:
      case 40:
        pallet.flipX();
        break;
    }
  });
  $('#clear_pallet').bind('click', pallet.clear);
  $('#flip_y').bind('click', pallet.flipY);
  $('#flip_x').bind('click', pallet.flipX);
};

pallet.toggleCursor = function() {
  if (pallet.cursor) {
    pallet.disableCursor();
  } else {
    pallet.enableCursor();
  }
};

pallet.enableCursor = function () {
  $('#cursor').show();
  pallet.cursor = true;
  $('#cursor').html($('#palletTable').clone());
  $(document).bind('mousemove', function(e){
    $('#cursor').css({
       left:  e.pageX - 78,
       top:   e.pageY - 247
    });
  });
  $('#copy_button').html('Cancel');
};

pallet.disableCursor = function () {
  $('#cursor').hide();
  $('#copy_button').html('Copy');
  pallet.cursor = false;
  $(document).unbind('mousemove');
};
pallet.updateCursor = function() {
  if (pallet.cursor){
    $('#cursor').html($('#palletTable').clone());
  }
};
pallet.clear = function () {
  var len = pallet.cells.length;
  for (var x = 0; x < len; x++) {
    for (var y = 0; y < len; y++) {
      pallet.cells[x][y].alive = false;
      pallet.cells[x][y].$el.removeClass('alive');
    }
  }
  pallet.updateCursor();
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
  pallet.updateCursor();
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
  pallet.updateCursor();
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
  pallet.updateCursor();
};