class PostsController < ApplicationController
  before_action :set_post, only: [ :update, :destroy, :restore ]
  before_action :authorize_post_action, only: [ :update, :destroy, :restore ]

  def index
    @posts = Post.where(thread_id: params[:thread_id])
                  .includes(:author)
                  .root_posts
                  .order(created_at: :asc)  # Always use created_at for consistent ordering

    load_nested_replies(@posts)
    render json: @posts,
            include: [
              "author",
              "replies",
              "replies.author",
              "replies.replies",
              "replies.replies.author",
              "replies.replies.replies",
              "replies.replies.replies.author"
            ],
            each_serializer: PostSerializer
  end

  def create
    unless current_user.can_create_content?
      render json: {
        error: "Your account is currently restricted and cannot create new content."
      }, status: :forbidden
      return
    end

    @post = current_user.posts.build(post_params)
    @post.thread_id = params[:thread_id]

    if @post.save
      # Update thread's updated_at for thread listing ordering
      @post.thread.touch(:updated_at)
      render json: @post, status: :created
    else
      render json: { errors: @post.errors.full_messages }, status: :unprocessable_entity
    end
  end


  def update
    @post.edited_at = Time.current
    if @post.update(post_params)
      # Don't update created_at or change position
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

  def load_nested_replies(posts, current_depth = 0)
    return if posts.empty? || current_depth >= 3

    post_ids = posts.map(&:id)

    # Keep original ordering by created_at
    replies = Post.where(parent_id: post_ids)
                  .includes(:author)
                  .order(created_at: :asc)

    replies_by_parent = replies.group_by(&:parent_id)

    posts.each do |post|
      child_replies = replies_by_parent[post.id] || []
      post.replies = child_replies

      if child_replies.any? && current_depth < 2
        load_nested_replies(child_replies, current_depth + 1)
      end
    end
  end

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
