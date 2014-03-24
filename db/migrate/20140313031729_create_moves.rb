class CreateMoves < ActiveRecord::Migration
  def change
    create_table :moves do |t|
      t.belongs_to :player, index: true
      t.integer :x
      t.integer :y
      t.integer :round

      t.timestamps
    end
  end
end
