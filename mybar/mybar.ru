require 'fileutils'
require 'digest/md5'

app = proc do |env|
	
	uri = env['REQUEST_URI']
	tempfile = env['HTTP_TEMPORY_FILE']
	path_to_dir = '/www/mybar/db/'
	salt = "GreenMohito"
	r = 'all ok! uri is ' + uri

	uri_arr = uri.split('/')

	if uri_arr[1] == 'createbar' and !tempfile.nil?
		userid = Digest::MD5.hexdigest(rand.to_s + Time.now.to_s).to_s[0, 15]
		directory_name = path_to_dir + userid
		if !FileTest::directory?(directory_name)
			Dir::mkdir(directory_name)
		end
		FileUtils.move(tempfile, directory_name + '/bar.json')
		r = "{ \"userid\" : \"#{userid}\", \"hash\" : \"#{Digest::MD5.hexdigest(userid + salt)}\" }"
	elsif uri_arr[1] == "savebar" and !tempfile.nil?
		userid = uri_arr[3]
		hash = uri_arr[2]
		directory_name = path_to_dir + userid
		if !FileTest::directory?(directory_name)
			Dir::mkdir(directory_name)
		end
		FileUtils.move(tempfile, directory_name + '/bar.json')
		r = "{ \"userid\" : \"#{userid}\", \"hash\" : \"#{hash}\" }"
	end

	[
		200,
		{
		  'Content-Type' => 'text'
		},
		[r]
	]
 
end

run app
