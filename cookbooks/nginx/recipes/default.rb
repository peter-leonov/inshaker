# nginx

# expecting Ubuntu 14.04 has no nginx package installed by default

package 'curl' do
  action :install
end

bash "install nginx with PPA" do
  not_if 'which nginx'
  code %{
    curl -s http://nginx.org/keys/nginx_signing.key | sudo apt-key add -
    add-apt-repository -s "deb http://nginx.org/packages/ubuntu/ precise nginx"
    apt-get update
  }
end

package 'nginx' do
  action :install
end

bash "disable autorun" do
  code %{
    sudo /etc/init.d/nginx stop
    sudo update-rc.d -f nginx remove
  }
end
