replayWrapper = {};

replayWrapper.init = function() {
  playerSetup.user_channel.bind('replay_list', replayWrapper.list);
  replayWrapper.request_list();
  $('body').on('click', '.start_replay', replayWrapper.select_replay);
}

replayWrapper.list = function(data) {
  table_data = [];
  $(data).each(function(i, replay) {
    table_data.push(HandlebarsTemplates.replay_row({
      'player_1_email': replay['player_1']['name'],
      'player_2_email': replay['player_2']['name'],
      'round':          replay['round'],
      'updated_at':     replay['updated_at'],
      'id':             replay['id'],
      'datetime':       replay['updated_at']
    }));
  });
  $('.replays tbody').html(table_data.join("\n"));
  $('.replays').removeClass('hidden');
};

replayWrapper.request_list = function() {
  playerSetup.dispatcher.trigger('get_replays', {});
}

replayWrapper.select_replay = function(event) {
  playerSetup.user_channel.bind('first_replay_turn', replayWrapper.first_replay_turn);
  playerSetup.dispatcher.trigger('select_replay', {game_id: event.target.attributes['game_id'].value})
};

replayWrapper.first_replay_turn = function(data) {
  playerSetup.current_user = data['player_1'];
  playerSetup.opponent = data['player_2'];
  $('.replays').hide();
  $('#find_opponent').hide();
  $('.list_replays').hide();
  gameWrapper.start_replay(data);
}
