
function loadGoogleApi ()
{
	var apiKeys =
	{
		'inshaker.peter.programica.ru': 'ABQIAAAARQzYWu9IpurDSJW9DIJqrxRQDmLIRrbgIlR4-DvZZCgj0RcLexQJq78HLFflzmM5Ka8WETeA0NLxwA',
		'inshaker.vaskas.programica.ru': 'ABQIAAAARQzYWu9IpurDSJW9DIJqrxQREQYsNTRM9xy8NZxnUU8bL0VtnhSjjuhT-zGZ42oWWqrhR9EXDzXnNw',
		'inshaker.mike.programica.ru': 'ABQIAAAARQzYWu9IpurDSJW9DIJqrxRNoEmkHlR0LBJ-kuMLS1qT8KG6DhQZlE7qvqGjzsnNOCNXY-Q4tLeKZg',
		'inshaker.barman.programica.ru': 'ABQIAAAARQzYWu9IpurDSJW9DIJqrxRoSFFn0eFsI-JMwoV5H95olICkthS-DWVvrBtomxsSInR3XbVM9Kkx7Q',
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

