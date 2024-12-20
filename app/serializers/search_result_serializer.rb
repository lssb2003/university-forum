class SearchResultSerializer < ActiveModel::Serializer
  attributes :id, :type, :title, :content, :url

  def type
    object.class.name.underscore
  end

  def title
    case object
    when Category
      object.name
    when ForumThread
      object.title
    when Post
      "Reply in #{object.thread.title}"
    end
  end

  def content
    case object
    when Category
      object.description
    when ForumThread, Post
      object.content
    end
  end

  def url
    case object
    when Category
      "/categories/#{object.id}"
    when ForumThread
      "/threads/#{object.id}"
    when Post
      "/threads/#{object.thread_id}#post-#{object.id}"
    end
  end
end
