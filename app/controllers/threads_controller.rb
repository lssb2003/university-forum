# app/controllers/threads_controller.rb
class ThreadsController < ApplicationController
  before_action :set_thread, only: [ :show, :update, :destroy, :lock, :unlock ]
  before_action :authorize_thread_action, only: [ :update, :destroy ]
  before_action :authorize_moderator_action, only: [ :lock, :unlock ]

  def index
    @threads = ForumThread
      .where(category_id: params[:category_id])
      .includes(:author)  # Include author to avoid N+1 queries
      .order(updated_at: :desc)  # Sort by most recently updated
    render json: @threads
  end

  def show
    Rails.logger.debug "=== Thread Show Debug ==="
    Rails.logger.debug "User: #{current_user.inspect}"
    Rails.logger.debug "Thread category: #{@thread.category_id}"

    if current_user&.moderator?
      Rails.logger.debug "Direct moderated categories: #{current_user.moderator_assignments.pluck(:category_id)}"
      Rails.logger.debug "All moderated categories (including subcategories): #{current_user.moderated_category_ids}"
      Rails.logger.debug "Can moderate?: #{can_moderate_thread?(@thread)}"
    end
    Rails.logger.debug "======================="

    render json: @thread
  end


  def update
    # Only set edited_at if content actually changes
    if thread_params[:title] != @thread.title || thread_params[:content] != @thread.content
      @thread.edited_at = Time.current
    end

    if @thread.update(thread_params)
      render json: @thread
    else
      render json: { errors: @thread.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def create
    unless current_user.can_create_content?
      render json: {
        error: "Your account is currently restricted and cannot create new content."
      }, status: :forbidden
      return
    end

    @thread = current_user.forum_threads.build(thread_params)
    @thread.category_id = params[:category_id]
    # Explicitly set edited_at to nil on creation
    @thread.edited_at = nil

    if @thread.save
      render json: @thread, status: :created
    else
      render json: { errors: @thread.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @thread.destroy
    head :no_content
  end

  def thread_params
    params.require(:thread).permit(:title, :content)
  end

  def lock
    if @thread.lock!
      render json: @thread
    else
      render json: { errors: @thread.errors.full_messages }, status: :unprocessable_entity
    end
  end


  def unlock
    if @thread.unlock!
      render json: @thread
    else
      render json: { errors: @thread.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def move
    @thread = ForumThread.find(params[:id])

    # Check if user can moderate both source and target categories
    unless can_moderate_thread?(@thread) &&
            current_user.can_moderate?(params[:category_id])
      return render json: { error: "Unauthorized" }, status: :unauthorized
    end

    target_category = Category.find(params[:category_id])

    if @thread.update(category: target_category)
      render json: @thread
    else
      render json: { errors: @thread.errors.full_messages },
              status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Category not found" }, status: :not_found
  end


  private

  def can_moderate_thread?(thread)
    return true if current_user&.admin?
    return false unless current_user&.moderator?

    # Use the exact same approach as lock/move
    direct_categories = current_user.moderator_assignments.includes(:category).map(&:category)
    all_categories = direct_categories.flat_map(&:self_and_descendant_ids)
    all_categories.include?(thread.category_id)
  end

  def authorize_moderator_action
    unless can_moderate_thread?(@thread)
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end

  def ensure_moderator
    unless current_user&.moderator? || current_user&.admin?
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end


  def set_thread
    @thread = ForumThread.find_by(id: params[:id])
    unless @thread
        render json: { error: "Thread not found" }, status: :not_found
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Thread not found" }, status: :not_found
  end

  def authorize_thread_action
    unless current_user&.admin? ||
            current_user&.id == @thread.author_id ||
            can_moderate_thread?(@thread)
    render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end

  def authorize_lock_action
    unless current_user&.admin? ||
          (current_user&.moderator? && current_user.moderated_categories.include?(@thread.category_id))
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end
end
