;(function(){

var Me =
{
	bootstrap: function (params)
	{
		var frame = $$('#share .frame')
		if (!frame || !frame[0]) // bad
			return
		
		frame = frame[0]
		frame.src = '/share-buttons.html?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent(params.text)
	}
}

Me.className = 'ShareButtons'
self[Me.className] = Me

})();
