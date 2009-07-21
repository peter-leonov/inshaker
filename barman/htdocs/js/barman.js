<!--# include virtual="programica.js" -->
// <!-- include virtual="util.js" -->

<!--# include virtual="uibutton.js" -->

$.onload(function(){
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
		
		var req = aPost("/act/launcher.cgi", fh);
		req.onSuccess = function (){
			$('output').innerHTML = this.responseText();
			inflateNode($('output'));
			goBarmanButton.setEnabled(true);
		}
	});
	
	var goUpButton = new UIButton($('goUp'), 'clicked', 'Обновить', 'Подожди...', function(e){
		goUpButton.setEnabled(false);
		
		squeezeNode($('output'));
		var req = aPost("/act/deployer.cgi", {});
		req.onSuccess = function (){
			$('output').innerHTML = this.responseText();
			inflateNode($('output'));
			goUpButton.setEnabled(true);
		}
	});
	
	ri.goToFrame(0); ri.onselect($('point_0'), 0);
})
