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
	
	init: function ()
	{
		var main = $('menu')
		var tabs = cssQuery('.content')
		var buttons = cssQuery('#menu a')
		
		LocationHash.bind(location)
		var name = LocationHash.get()
		
		// var hrefs = ['view-about', 'view-cocktail-friend', 'view-stat']
		var hrefs = tabs.map(function (v) { return String(v.className).split(/\s+/)[0] })
		log(hrefs)
		
		var sw = Switcher.bind(main, buttons, tabs)
		sw.select(hrefs.indexOf(name))
		// sw.onselect = function (num) { location.hash = hrefs[num] }
		
		LocationHash.onchange = function (now, last) { sw.select(hrefs.indexOf(now)); log(now) }
		
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

