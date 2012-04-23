;(function(){

var Me =
{
	bootstrap: function (params)
	{
		var frame = $$('#share .frame')
		if (!frame || !frame[0]) // bad
			return
		
		var l = window.location
		var href = l.protocol + '//' + l.host + l.pathname + (l.search ? l.search + '&from=share-button' : '?from=share-button') + l.hash
		
		frame = frame[0]
		frame.src = '/share-buttons.html?url=' + encodeURIComponent(href) + '&text=' + encodeURIComponent(params.text)
	}
}

Me.className = 'ShareButtons'
self[Me.className] = Me

})();
