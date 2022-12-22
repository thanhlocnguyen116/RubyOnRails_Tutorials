# frozen_string_literal: true

class AddAuthorToPost < ActiveRecord::Migration[6.1]
  def change
    add_column :posts, :user_id, :integer
  end
end
