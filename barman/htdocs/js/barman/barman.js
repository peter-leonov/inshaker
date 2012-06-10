<!--# include virtual="/liby/modules/prototype.js" -->
<!--# include virtual="/liby/modules/element.js" -->
<!--# include virtual="/liby/modules/cosy.js" -->
<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/date.js" -->
<!--# include virtual="/liby/modules/cookie.js" -->
<!--# include virtual="/liby/modules/json.js" -->
<!--# include virtual="/liby/modules/form-helper.js" -->
<!--# include virtual="/liby/modules/event-driven.js" -->

<!--# include virtual="/liby/widgets/tab-switcher.js" -->

<!--# include virtual="uibutton.js" -->

$.onready(function()
{
	var nodes =
	{
		logo: $('.logo'),
		
		shakerPage: $('.page.shaker'),
		shake: $('.shaker .shake'),
		processorsList: $('.shaker .processors-list'),
		viewStatus: $('.shaker .view-status'),
		resetState: $('.shaker .reset-state'),
		gotoUploader: $('.goto-uploader'),
		
		uploaderPage: $('.page.uploader'),
		upload: $('.uploader .upload'),
		gotoShaker: $('.goto-shaker'),
		
		output: $('#output')
	}
	
	;(function(){
		
		var tsNodes =
		{
			tabs: [nodes.gotoShaker, nodes.gotoUploader],
			sections: [nodes.shakerPage, nodes.uploaderPage]
		}
		
		var tabSwitcher = new TabSwitcher()
		tabSwitcher.bind(tsNodes)
		
	})();
	
	
	nodes.logo.addEventListener('click', function (e) { document.documentElement.classList.toggle('advanced') }, false)
	
	
	var running = false
	function run (path, hash, callback)
	{
		if (running)
			return false
		running = true
		
		var output = nodes.output
		
		var r = new XMLHttpRequest()
		r.open('POST', path, true)
		r.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
		r.send(UrlEncode.stringify(hash))
		
		output.innerHTML = ''
		
		r.onreadystatechange = function (e)
		{
			if (this.status != 200)
				output.classList.add('server-error')
			else
				output.classList.remove('server-error')
			
			var readyState = this.readyState
			
			// data + load
			if (readyState >= 3)
			{
				output.innerHTML = r.responseText
				output.scrollTop = output.scrollHeight
			}
			
			// load
			if (readyState == 4)
			{
				running = false
				callback()
			}
		}
		
		return true
	}
	
	var host = location.host.replace(/^m\./, '')
	var parentLink = $('#parent-link')
	parentLink.href = '//' + host + '/'
	parentLink.firstChild.nodeValue = host
	
	var memory = JSON.parse(Cookie.get('barman-memory'));
	if (memory)
	{
		var inputs = nodes.processorsList.getElementsByTagName('input')
		for (var i = 0; i < inputs.length; i++){
			inputs[i].checked = memory[inputs[i].name] ? 'checked' : ''
		}
	}
	
	function remember (e)
	{
		var fh = FormHelper.toHash(nodes.processorsList)
		Cookie.set('barman-memory', JSON.stringify(fh), Date.diff('1y'))
	}
	nodes.processorsList.addEventListener('click', remember, false)
	
	new UIButton(nodes.shake).onaction = function (e)
	{
		var button = this
		
		var fh = FormHelper.toHash(nodes.processorsList)
		
		if (run('/act/launcher.cgi', fh, function () { button.enable() }))
			button.disable()
	}
	
	new UIButton(nodes.upload).onaction = function (e)
	{
		var button = this
		
		if (run('/act/launcher.cgi', {deployer: 'on'}, function () { button.enable() }))
			button.disable()
	}
	
	new UIButton(nodes.viewStatus).onaction = function (e)
	{
		var button = this
		
		if (run('/act/launcher.cgi', {status: 'on'}, function () { button.enable() }))
			button.disable()
	}
	
	new UIButton(nodes.resetState).onaction = function (e)
	{
		if (!window.confirm('Сброшу состояние бармена до состояния сайта.\nЭто не больно.'))
			return
		
		var button = this
		
		if (run('/act/launcher.cgi', {reset: 'on'}, function () { button.enable() }))
			button.disable()
	}
})
