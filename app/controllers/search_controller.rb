class SearchController < ApplicationController
  def index
    @query = params[:q]&.strip
    return render json: { results: [] } if @query.blank?

    @categories = Category.search(@query)
    @threads = ForumThread.search(@query)
    @posts = Post.search(@query)

    results = {
      categories: serialize_collection(@categories, CategorySerializer),
      threads: serialize_collection(@threads, ForumThreadSerializer),
      posts: serialize_collection(@posts, PostSerializer)
    }

    render json: results
  end

  def suggestions
    @query = params[:q]&.strip
    return render json: { suggestions: [] } if @query.blank?

    suggestions = {
        categories: Category.search_suggestions(@query).map { |c| { id: c.id, text: c.name, type: "category" } },
        threads: ForumThread.search_suggestions(@query).map { |t| { id: t.id, text: t.title, type: "thread" } },
        # Only include non-deleted posts
        posts: Post.not_deleted.search_suggestions(@query).map { |p| {
            id: p.id,
            text: truncate_text(p.content),
            type: "post",
            thread_id: p.thread_id
        }}
    }

    render json: { suggestions: suggestions.values.flatten.first(10) }
  end

  private

  def serialize_collection(records, serializer_class)
    records.map { |record| serializer_class.new(record).as_json }
  end

  def truncate_text(text, length = 100)
    return text unless text.length > length
    text[0...length].rstrip + "..."
  end
end
