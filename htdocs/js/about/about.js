var About = {
	formSuccess: function(){
		$('feedback_form').hide();
		$('form_success').show();
	},
	
	formShow: function(){
		$('form_success').hide();
		$('feedback_form').show();
	},
	
	hidePoster: function(){
		$('panel_cocktail').style.marginBottom = "0";
		$('poster').style.display = "none";
	},
	
	showPoster: function(){
		$('panel_cocktail').style.marginBottom = "142px";
		$('poster').style.display = "block";		
	},
	
	init: function(){
		$('view-advert').show = function() {
			this.style.display = "block";
			About.hidePoster();
		}
		
		$('view-advert').hide = function(){
			this.style.display="none";
			About.showPoster();
		}
		
		$('view-stat').show = function() {
			this.style.display = "block";
			if($('rolling_stats').RollingImagesLite)
				$('rolling_stats').RollingImagesLite.goInit();
				
			About.hidePoster();
		}
		
		$('view-stat').hide = function(){
			this.style.display="none";
			About.showPoster();
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
		
		var line = new SWFObject("stat/amcharts/amline.swf", "amline", "510", "390", "8", "#FFFFFF");
		line.addVariable("path", "stat/amcharts/");
		line.addParam("wmode", "opaque");
		line.addVariable("settings_file", escape("stat/visitors/settings.xml"));
		line.addVariable("data_file", escape("stat/visitors/data.xml"));
		line.write("stat_visits");

		var pie = new SWFObject("stat/amcharts/ampie.swf", "ampie", "510", "400", "8", "#FFFFFF");
		pie.addVariable("path", "stat/amcharts/");
		pie.addParam("wmode", "opaque");
		pie.addVariable("settings_file", escape("stat/cities/settings.xml"));
		pie.addVariable("data_file", escape("stat/cities/data.xml"));		
		pie.addVariable("preloader_color", "#999999");
		pie.write("stat_cities");
	}
};