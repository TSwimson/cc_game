class CreateMoves < ActiveRecord::Migration
  def change
    create_table :moves do |t|
      t.belongs_to :user, index: true
      t.belongs_to :game, index: true
      t.text :points
      t.integer :round

      t.timestamps
    end
  end
end