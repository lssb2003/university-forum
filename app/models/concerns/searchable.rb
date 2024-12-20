module Searchable
  extend ActiveSupport::Concern

  included do
    # Add PostgreSQL trigram extension if not exists
    connection.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;") unless connection.extension_enabled?("pg_trgm")
  end

  module ClassMethods
    def search(query)
      return all if query.blank?

      # Define searchable columns based on model
      columns = case name
      when "Category"
        [ "name", "description" ]
      when "ForumThread"
        [ "title", "content" ]
      when "Post"
        [ "content" ]
      else
        return none
      end

      # Build conditions for each column using ILIKE for case-insensitive search
      conditions = columns.map { |column| "#{table_name}.#{column} ILIKE :query" }

      # Combine conditions with OR
      where(conditions.join(" OR "), query: "%#{sanitize_sql_like(query)}%")
    end

    def search_suggestions(query, limit = 5)
      search(query).limit(limit)
    end
  end
end
