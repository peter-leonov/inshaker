var Delivery = {
	formSuccess: function(){
		$('feedback_form').hide();
		$('form_success').show();
	},
	
	formShow: function(){
		$('form_success').hide();
		$('feedback_form').show();
	},
	
	init: function(){		
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
		bottom_links[0].addEventListener('click', function(e){
			handler(e, menu_links[0]);
		}, false);
		
		bottom_links[1].addEventListener('click', function(e){
			handler(e, menu_links[3]);
		}, false);
		
		link = new Link();
		if (!link.url) link.element = $('view-delivery');
		else if (link.url != 'view-delivery') $('view-delivery').hide();
	}
};