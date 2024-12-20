class PostsController < ApplicationController
  before_action :set_post, only: [ :update, :destroy, :restore ]
  before_action :authorize_post_action, only: [ :update, :destroy, :restore ]

  def index
    @posts = Post.where(thread_id: params[:thread_id])
                 .includes(:author, :replies)
                 .root_posts
                 .order(created_at: :asc)
                 render json: @posts, include: [ "author", "replies", "replies.author" ]
  end

  def create
    @post = current_user.posts.build(post_params)
    @post.thread_id = params[:thread_id]

    if @post.save
      render json: @post, status: :created
    else
      render json: { errors: @post.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @post.update(post_params)
      render json: @post
    else
      render json: { errors: @post.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @post.soft_delete!
    head :no_content
  end

  def restore
    if @post.update(deleted_at: nil)
      render json: @post
    else
      render json: { errors: @post.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end

  def post_params
    params.require(:post).permit(:content, :parent_id)
  end

  def authorize_post_action
    unless current_user&.admin? ||
           current_user&.id == @post.author_id ||
           can_moderate?(@post.thread)
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end

  def can_modify_post?(post)
    return true if current_user.admin?
    return true if current_user.moderator? && current_user.moderated_categories.include?(post.thread.category_id)
    current_user.id == post.author_id
  end

  def can_moderate?(thread)
    return true if current_user&.admin?
    return false unless current_user&.moderator?

    direct_categories = current_user.moderator_assignments.includes(:category).map(&:category)
    all_categories = direct_categories.flat_map(&:self_and_descendant_ids)
    all_categories.include?(thread.category_id)
  end
end
