CcGame::Application.routes.draw do
  devise_for :users
  root to: 'site#index'
  resources :players, only: ['index', 'create', 'update']
  resources :games, only: ['create', 'show']
end
