
function loadGoogleApi ()
{
	var apiKeys =
	{
		'programica.ru':  'ABQIAAAARQzYWu9IpurDSJW9DIJqrxQVF992HTeapfH7j2YfASPwC0rg6BRLdvrEuTsIejJP0tsK0O0WOScMCw',
		'inshaker.ru': 'ABQIAAAARQzYWu9IpurDSJW9DIJqrxRkBrAtdI-gKvPAeDorTK26GBT4DBTWsZV4qSbs-J27hgsqukt5Ef_TCg'
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
	
	return $.include('http://www.google.com/jsapi?key=' + apiKeys[/[^.]+\.[^.]+$/i.exec(location.host)])
}

