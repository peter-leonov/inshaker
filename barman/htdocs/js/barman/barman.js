<!--# include virtual="/lib-0.3/core/prototype.js" -->
<!--# include virtual="/lib-0.3/modules/element.js" -->
<!--# include virtual="/lib-0.3/modules/selectors.js" -->
<!--# include virtual="/lib-0.3/modules/cosy.js" -->
<!--# include virtual="/lib-0.3/modules/onready.js" -->
<!--# include virtual="/lib-0.3/modules/url-encode.js" -->
<!--# include virtual="/lib-0.3/modules/cookie.js" -->
<!--# include virtual="/lib-0.3/modules/json.js" -->
<!--# include virtual="/lib-0.3/modules/form-helper.js" -->
<!--# include virtual="/lib-0.3/modules/event-driven.js" -->

<!--# include virtual="/lib-0.3/widgets/tab-switcher.js" -->

<!--# include virtual="uibutton.js" -->

$.onready(function()
{
	var nodes =
	{
		shakerPage: $$('.page.shaker')[0],
		shake: $$('.shaker .shake')[0],
		processorsList: $$('.shaker .processors-list')[0],
		viewStatus: $$('.shaker .view-status')[0],
		resetState: $$('.shaker .reset-state')[0],
		gotoUploader: $$('.goto-uploader')[0],
		
		uploaderPage: $$('.page.uploader')[0],
		upload: $$('.uploader .upload')[0],
		gotoShaker: $$('.goto-shaker')[0],
		
		output: $('output')
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
	if (memory)
	{
		var inputs = nodes.processorsList.getElementsByTagName('input')
		for (var i = 0; i < inputs.length; i++){
			inputs[i].checked = memory[inputs[i].name] ? 'checked' : ''
		}
	}
	
	new UIButton(nodes.shake).onaction = function (e)
	{
		var button = this
		
		var fh = FormHelper.toHash(nodes.processorsList)
		Cookie.set('barman-memory', JSON.stringify(fh))
		
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
