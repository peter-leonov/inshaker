
function loadGoogleApi ()
{
	var apiKeys =
	{
		'inshaker.petr.programica.ru': 'ABQIAAAARQzYWu9IpurDSJW9DIJqrxSXvIsyqgyb_kGywp9iIuSiaeA-JBQzTsDzLup3dwyBVfsiow2oek-qcQ',
		'inshaker.vaskas.programica.ru': 'ABQIAAAARQzYWu9IpurDSJW9DIJqrxQREQYsNTRM9xy8NZxnUU8bL0VtnhSjjuhT-zGZ42oWWqrhR9EXDzXnNw',
		'inshaker.mike.programica.ru': 'ABQIAAAARQzYWu9IpurDSJW9DIJqrxRNoEmkHlR0LBJ-kuMLS1qT8KG6DhQZlE7qvqGjzsnNOCNXY-Q4tLeKZg',
		'www.inshaker.ru': 'ABQIAAAARQzYWu9IpurDSJW9DIJqrxRWeW9DvTiqRhftHfTMDG_ph9VZURSEW04TAvZRTH8g9VZCBYmnFl9AzA'
	}
	
	function waitGoogleApi ()
	{
		if (self.google)
		{
			clearInterval(timer)
			if (self.googleApiLoaderIsLoaded)
				self.googleApiLoaderIsLoaded()
		}
		
	}
	var timer = setInterval(waitGoogleApi, 250)
	
	return $.include('http://www.google.com/jsapi?key=' + apiKeys[location.hostname])
}

