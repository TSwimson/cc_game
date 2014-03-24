class CreateGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.integer :round
      t.string :status

      t.timestamps
    end
  end
end
