execute "apt-get update & upgrade" do
  command "apt-get update"
  command "apt-get upgrade -y"
end

# reboot "now" do
#   action :reboot_now
#   reason "To let apt-get upgrade changes take place."
# end

user "www" do
  action :create
  username "www"
  supports manage_home: true
  home "/home/www"
  shell "/bin/bash"
end

bash "set up www ssh keys" do
  code %{
    cp -r /home/vagrant/.ssh /home/www/.ssh
    chown -R www:www /home/www/.ssh
  }
  not_if 'test -f /home/www/.ssh/authorized_keys'
end

package 'sudo' do
  action :install
end

file "/etc/sudoers.d/www" do
  owner 'root'
  group 'root'
  mode '0440'
  action :create_if_missing

  content %{www ALL=(ALL) NOPASSWD:ALL}
end

# gem_package "foreman"
