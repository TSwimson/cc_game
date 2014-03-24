class CreatePlayers < ActiveRecord::Migration
  def change
    create_table :players do |t|
      t.string :name
      t.string :status
      t.belongs_to :game, index: true

      t.timestamps
    end
  end
end
