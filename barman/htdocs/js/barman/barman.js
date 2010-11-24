<!--# include virtual="programica.js" -->
// <!-- include virtual="util.js" -->

<!--# include virtual="uibutton.js" -->

$.onready(function(){
	
	var host = location.host.replace(/^m\./, '')
	var parentLink = $('parent-link')
	parentLink.href = '//' + host + '/'
	parentLink.firstChild.nodeValue = host
	
	var ri = new Programica.RollingImagesLite($('ri'), {animationType: 'directJump'});
	
	var inflateNode = function(node){ 
		node.style.visibility="visible"; 
		var ht = (node.scrollHeight > 300) ? 300 : node.scrollHeight;
		node.animate("easeInCubic", {height: ht}, 0.15) 
	};
	var squeezeNode = function(node){ 
		node.animate("easeInCubic", {height: 0}, 0.15);
		node.style.visibility="hidden";
	};
	
	var labels = ["Бармен", "Сайт"];
	ri.onselect = function(node, num){
		if(labels[num-1]) $('left').innerHTML  = "← " + labels[num-1];
		if(labels[num+1]) $('right').innerHTML = labels[num+1] + " →";
		squeezeNode($('output'))
	}
	
	var memory = Object.parse(Cookie.get('barman-memory'));
	if (memory){
		var inputs = $('barman-form').getElementsByTagName('input')
		for (var i = 0; i < inputs.length; i++){
			inputs[i].checked = memory[inputs[i].name] ? 'checked' : ''
		}
	}
	
	var goBarmanButton = new UIButton($('goBarman'), 'clicked', 'Смешать', 'Подожди...', function(e){
		var fh = $('barman-form').toHash();
		Cookie.set('barman-memory', Object.stringify(fh));
		
		goBarmanButton.setEnabled(false);
		squeezeNode($('output'));
		
		var r = new XMLHttpRequest()
		r.open('POST', "/act/launcher.cgi", true)
		r.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
		r.send(Programica.Request.urlEncode(fh))
		
		r.onreadystatechange = function (e)
		{
			var output = $('output')
			
			var readyState = this.readyState
			
			// data + load
			if (readyState >= 3)
				output.innerHTML = r.responseText
			
			// load
			if (readyState == 4)
			{
				output.innerHTML = r.responseText
				output.scrollTop = 20000
				inflateNode(output)
				goBarmanButton.setEnabled(true);
			}
		}
	});
	
	var goUpButton = new UIButton($('goUp'), 'clicked', 'Залить', 'Подожди...', function(e){
		goUpButton.setEnabled(false);
		
		squeezeNode($('output'));
		var req = aPost("/act/deployer.cgi", {});
		req.onSuccess = function (){
			var output = $('output')
			output.innerHTML = this.responseText()
			output.scrollTop = 10000
			inflateNode(output)
			goUpButton.setEnabled(true);
		}
	});
	
	ri.goToFrame(0); ri.onselect($('point_0'), 0);
})
