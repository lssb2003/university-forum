class SearchController < ApplicationController
  def index
    @query = params[:q]&.strip
    return render json: { results: [] } if @query.blank?

    Rails.logger.debug "Starting search for query: #{@query}"
    # Only search for non-deleted posts
    @categories = Category.search(@query)
    @threads = ForumThread.search(@query)
    @posts = Post.not_deleted.search(@query)  # Add not_deleted scope here

    Rails.logger.debug "Found posts before filtering: #{@posts.length}"

    @posts = @posts.reject(&:deleted?)

    Rails.logger.debug "Posts after deletion check: #{@posts.length}"

    # Ensure all collections are arrays, even if empty
    @categories ||= []
    @threads ||= []
    @posts ||= []

    results = {
      categories: serialize_collection(@categories, CategorySerializer),
      threads: serialize_collection(@threads, ThreadSerializer),
      posts: serialize_collection(@posts, PostSerializer)
    }

    render json: results
  end
  def suggestions
    @query = params[:q]&.strip
    return render json: { suggestions: [] } if @query.blank?

    posts_suggestions = Post.not_deleted
                        .where("content ILIKE :query", query: "%#{@query}%")
                        .reject(&:deleted?)
                        .map { |p| {
                          id: p.id,
                          text: truncate_text(p.content),
                          type: "post",
                          thread_id: p.thread_id,
                          parent_id: p.parent_id  # Add parent_id for UI hints
                        }}

    # Add thread_title to post suggestions
    posts_suggestions.each do |suggestion|
      thread = ForumThread.find_by(id: suggestion[:thread_id])
      suggestion[:thread_title] = thread&.title
    end

    suggestions = {
      categories: Category.search_suggestions(@query)
                        .map { |c| { id: c.id, text: c.name, type: "category" } },
      threads: ForumThread.search_suggestions(@query)
                        .map { |t| { id: t.id, text: t.title, type: "thread" } },
      posts: posts_suggestions
    }

    render json: { suggestions: suggestions.values.flatten.first(10) }
  end



  private

  def serialize_collection(records, serializer_class)
    return [] if records.nil? || records.empty?
    records.map { |record| serializer_class.new(record).as_json }
  end

  def truncate_text(text, length = 100)
    return text unless text.length > length
    text[0...length].rstrip + "..."
  end
end
