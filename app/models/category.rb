class Category < ApplicationRecord
  include Searchable # for searching
  validates :name, presence: true, uniqueness: true
  validates :description, presence: true
  validate :prevent_self_referential_parent, if: -> { parent_category_id.present? }

  belongs_to :parent_category, class_name: "Category", optional: true
  has_many :subcategories, -> { order(created_at: :desc) },
            class_name: "Category",
            foreign_key: "parent_category_id",
            dependent: :nullify
  has_many :moderator_assignments, class_name: "Moderator", dependent: :destroy
  has_many :moderators, through: :moderator_assignments, source: :user
  has_many :forum_threads, dependent: :destroy

  before_destroy :ensure_no_circular_references

  scope :ordered, -> { order(created_at: :desc) }
  scope :top_level_categories, -> { where(parent_category_id: nil).ordered }

  def self_and_descendant_ids
    descendant_ids = Category.where(parent_category_id: id).pluck(:id)
    [ id ] + descendant_ids
  end

  # Method to fetch only top-level categories
  def self.top_level_categories
    where(parent_category_id: nil)
  end

  # Check if category is a subcategory
  def subcategory?
    parent_category_id.present?
  end

  # Get the level of nesting (0 for top-level, 1 for subcategory)
  def nesting_level
    parent_category_id.present? ? 1 : 0
  end

  private

  def ensure_no_circular_references
      if subcategories.exists?
          subcategories.update_all(parent_category_id: nil)
      end
  end

  def prevent_self_referential_parent
    if parent_category_id == id
      errors.add(:parent_category_id, "cannot be self-referential")
    end
  end

  def prevent_deep_nesting
    return unless parent_category_id.present?

    parent = Category.find_by(id: parent_category_id)
    if parent&.parent_category_id.present?
      errors.add(:parent_category_id, "can only create categories up to one level deep. The selected parent category is already a subcategory.")
    end
  end
end
