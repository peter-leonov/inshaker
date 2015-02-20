
bash "timezone Moscow" do
  code %{
    timedatectl set-timezone Europe/Moscow
  }
end

# used as `funzip` in bars/map.rb for unziping exported KMZ to KML on the fly
package 'unzip' do
  action :install
end

directory "/www" do
  owner 'www'
  group 'www'
end

file "/home/www/.ssh/config" do
  owner 'www'
  group 'www'
  mode '0700'
  action :create_if_missing
  
  content <<-EOF
  Host back
  HostName %h.inshaker.ru
  Port 22333
  User www
  EOF
end

# bash "clone the project git repo" do
#   code %{
#     git clone git@github.com:inshaker/inshaker.com.git /www/inshaker
#     chown -R www:www /www/inshaker
#   }
#   not_if %{ test -d /www/inshaker/.git }
# end


# bash "bundle all" do
#   code %{
#     su -l -c 'cd /www/inshaker;            bundle' www
#     su -l -c 'cd /www/inshaker/rails;      bundle' www
#     su -l -c 'cd /www/inshaker/combinator; bundle' www
#   }
# end
