# config/routes.rb
Rails.application.routes.draw do
  # Authentication routes
  post "/auth/login", to: "authentication#login"
  post "/auth/register", to: "authentication#register"
  post "/auth/logout", to: "authentication#logout"
  post "/auth/forgot-password", to: "authentication#forgot_password"
  post "/auth/reset-password", to: "authentication#reset_password"
  post "auth/forgot-password", to: "authentication#forgot_password"

  get "/search", to: "search#index"
  get "/search/suggestions", to: "search#suggestions"

  # API routes
  resources :categories do
    resources :threads, only: [ :index, :create ]
  end

  resources :threads do
    member do
      post :lock
      post :unlock
      put :move  # Add this line
      put "move", to: "threads#move"
    end
    resources :posts, only: [ :index, :create ]
  end


  resources :posts, only: [ :update, :destroy ] do
    member do
      put :restore  # Added for post restoration
    end
  end

  namespace :admin do
    resources :users do
      member do
        put :update_role
      end
    end
    resources :moderators, only: [ :create, :destroy ]
    resources :categories, only: [ :create, :update, :destroy ]
  end

  resources :users do
    member do
      get "moderated_categories"  # Add this line
    end
  end
end
