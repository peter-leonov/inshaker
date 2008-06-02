var About = {
	formSuccess: function(){
		$('feedback_form').hide();
		$('form_success').show();
	},
	
	formShow: function(){
		$('form_success').hide();
		$('feedback_form').show();
	},
	
	init: function(){
		$('view-advert').show = function() {
			this.style.display = "block";
			$('panel_cocktail').style.marginBottom = "0";
			$('poster').style.display = "none";
		}
		
		$('view-advert').hide = function(){
			this.style.display="none";
			$('panel_cocktail').style.marginBottom = "142px";
			$('poster').style.display = "block";
		}
		
		var handler = function(e, element) {
			var self = element || this;
			link.open(self);
			self.parentNode.now.remClassName('now');
			self.addClassName('now');
			self.parentNode.now = self;
			e.preventDefault();
		};
		
		menu = $('panel_cocktail');
		var menu_links = menu.getElementsByTagName('a');
		var loc = window.location.hash;
		for (var i = menu_links.length - 1; i >= 0; i--) {
			if(loc && menu_links[i].href.indexOf(loc) > -1) menu.now = menu_links[i];
			menu_links[i].addEventListener('click', handler, false);
		}
		if(!menu.now) menu.now = menu_links[0];
		menu.now.addClassName("now");
		
		var bottom_links = $('bottom').getElementsByTagName('a');
		for(var i = 1; i < bottom_links.length; i++) {
			bottom_links[i].addEventListener('click', function(idx){ return function(e){
				handler(e, menu_links[idx]);
			}}(i-1), false);
		}
		
		link = new Link();
		if (!link.url) link.element = $('view-about');
		else if (link.url != 'view-about') $('view-about').hide();
	}
};