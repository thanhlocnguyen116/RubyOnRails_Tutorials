# frozen_string_literal: true

class ProductDetailsController < ApplicationController
  before_action :store_location

  def index
    env_http_forwarded = request.env['HTTP_X_FORWARDED_FOR']

    client_ip = if env_http_forwarded
                  env_http_forwarded.split(',').first
                else
                  request.remote_ip
                end
    id = params[:id].match(/\d+$/)[0].to_i
    product_view = ProductView.new(product_id: id, ip_address: client_ip, city: request.location.city, user_id: current_user ? current_user.id : '') # when user don't login or was logged before ago
    p_view = ProductView.find_by(ip_address: client_ip, product_id: id)
    if current_user && p_view&.ip_address == client_ip # && p_view.user_id.blank? # when user login
      p_view.update_attribute(:user_id, current_user.id)
    end
    product_view.save(validate: false) unless p_view
    p_view&.touch(:updated_at) if p_view&.user_id == current_user&.id # update updated_at viewing history
    recommend_items = Product.show_products Product::SHOW_HOME[:feature]
    product = Product.find(id)
    admin = User.find(product.user_id)
    categories = Category.show_category.limit(4)
    products = Product.where(categories_id: product.categories_id).limit(4)
    comment_user = Comment.includes(:user)
    reply_comment_id = comment_user.pluck('reply_comment_id').compact
    comments = comment_user.where(product_id: id).where(main_id: comment_user.pluck('id')).page(params[:page]).per(6)
    comment_children = comment_user.where(reply_comment_id: reply_comment_id)
    product_rates = ProductRate.where(product_id: id)
    sum_rate = product_rates.sum(&:rate)
    count_product = product_rates.size
    avg = count_product.zero? ? 5 : sum_rate / count_product
    brands = Brand.all
    notifications = Notification.newest.limit(5)

    @results = {
      avg: avg,
      admin: admin,
      product: product,
      products: products,
      categories: categories,
      recommend_items: recommend_items,
      comments: comments,
      brands: brands,
      notifications: notifications,
      comment_children: comment_children
    }
  end
end
