<!--# include virtual="/lib-0.3/core/prototype.js" -->
<!--# include virtual="/lib-0.3/modules/element.js" -->
<!--# include virtual="/lib-0.3/modules/cosy.js" -->
<!--# include virtual="/lib-0.3/modules/onready.js" -->
<!--# include virtual="/lib-0.3/modules/url-encode.js" -->
<!--# include virtual="/lib-0.3/modules/cookie.js" -->
<!--# include virtual="/lib-0.3/modules/json.js" -->

<!--# include virtual="uibutton.js" -->

$.onready(function(){
	
	var output = $('output')
	
	var running = false
	function run (path, hash, callback)
	{
		if (running)
			return false
		running = true
		
		var r = new XMLHttpRequest()
		r.open('POST', path, true)
		r.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
		r.send(UrlEncode.stringify(hash))
		
		output.innerHTML = ''
		
		r.onreadystatechange = function (e)
		{
			if (this.status != 200)
				output.addClassName('server-error')
			else
				output.removeClassName('server-error')
			
			var readyState = this.readyState
			
			// data + load
			if (readyState >= 3)
			{
				output.innerHTML = r.responseText
				output.scrollTop = 20000
			}
			
			// load
			if (readyState == 4)
			{
				output.innerHTML = r.responseText
				running = false
				callback()
			}
		}
		
		return true
	}
	
	var host = location.host.replace(/^m\./, '')
	var parentLink = $('parent-link')
	parentLink.href = '//' + host + '/'
	parentLink.firstChild.nodeValue = host
	
	var memory = JSON.parse(Cookie.get('barman-memory'));
	if (memory){
		var inputs = $('barman-form').getElementsByTagName('input')
		for (var i = 0; i < inputs.length; i++){
			inputs[i].checked = memory[inputs[i].name] ? 'checked' : ''
		}
	}
	
	var goBarmanButton = new UIButton($('goBarman'), 'clicked', 'Смешать', 'Подожди...', function(e)
	{
		var fh = $('barman-form').toHash();
		Cookie.set('barman-memory', JSON.stringify(fh));
		
		function done ()
		{
			goBarmanButton.setEnabled(true)
		}
		
		if (run('/act/launcher.cgi', fh, done))
			goBarmanButton.setEnabled(false)
	});
	
	var goUpButton = new UIButton($('goUp'), 'clicked', 'Залить', 'Подожди...', function(e)
	{
		function done ()
		{
			goUpButton.setEnabled(true)
		}
		
		if (run('/act/launcher.cgi', {deployer: 'on'}, done))
			goUpButton.setEnabled(false)
	});
	
	var goStatusButton = new UIButton($('view-status'), 'clicked', $('view-status').innerHTML, 'Подожди...', function(e)
	{
		function done ()
		{
			goStatusButton.setEnabled(true)
		}
		
		if (run('/act/launcher.cgi', {status: 'on'}, done))
			goStatusButton.setEnabled(false)
	});
	
	var goResetButton = new UIButton($('reset-state'), 'clicked', $('reset-state').innerHTML, 'Подожди...', function(e)
	{
		if (!window.confirm('Сброшу состояние бармена до состояния сайта.\nЭто не больно.'))
			return
		
		function done ()
		{
			goResetButton.setEnabled(true)
		}
		
		if (run('/act/launcher.cgi', {reset: 'on'}, done))
			goResetButton.setEnabled(false)
	});
})
