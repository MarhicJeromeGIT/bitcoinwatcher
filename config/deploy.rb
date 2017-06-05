set :application, 'bitcoin'
set :repo_url, 'git@github.com:MarhicJeromeGIT/bitcoinwatcher.git'

set :rvm_ruby_version, '2.3.0@bitcoin'

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
# set :deploy_to, '/var/www/my_app_name'

# Default value for :scm is :git
# set :scm, :git

# Default value for :format is :airbrussh.
# set :format, :airbrussh

# You can configure the Airbrussh format using :format_options.
# These are the defaults.
# set :format_options, command_output: true, log_file: 'log/capistrano.log', color: :auto, truncate: :auto

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
append :linked_files, 'config/database.yml', 'config/secrets.yml', '.env'

# Default value for linked_dirs is []
append :linked_dirs, 'log', 'tmp/pids', 'tmp/cache', 'tmp/sockets', 'public/system', 'node_modules'

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
# set :keep_releases, 5

# classic way of restarting passenger
set :passenger_restart_with_touch, true

namespace :deploy do

  task :setup_webpack do
    on roles(:app) do
      within release_path do
        with rails_env: fetch(:stage) do
          #execute "cd '#{release_path}'; ./bin/rails webpacker:install"
          #execute "cd '#{release_path}'; ./bin/rails webpacker:compile"
          execute :bundle, 'exec rake webpack:compile'
        end
      end
    end
  end

  #after "deploy:updated", "deploy:setup_webpack"
end