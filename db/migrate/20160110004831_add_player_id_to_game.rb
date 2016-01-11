class AddPlayerIdToGame < ActiveRecord::Migration
  def change
    add_column :games, :player_1_id, :integer
    add_column :games, :player_2_id, :integer

    add_index :games, :player_1_id
    add_index :games, :player_2_id
  end
end
