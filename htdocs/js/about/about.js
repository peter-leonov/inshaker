var AboutPage = {
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
		var tabs = $$('.content')
		var buttons = $$('#menu a')
		
		var locationHash = new LocationHash()
		locationHash.bind()
		var name = locationHash.get()
		
		// var hrefs = ['view-about', 'view-cocktail-friend', 'view-stat']
		var hrefs = tabs.map(function (v) { return String(v.className).split(/\s+/)[0] })
		
		var sw = Switcher.bind(main, buttons, tabs)
		var selected = hrefs.indexOf(name)
		sw.select(selected >= 0 ? selected : 0)
		// sw.onselect = function (num) { location.hash = hrefs[num] }
		
		locationHash.addEventListener('change', function () { sw.select(hrefs.indexOf(this.get())) }, false)
		
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
		
		var form = $('feedback_form')
		function sendListener (e)
		{
			e.preventDefault()
			
			function sent (e)
			{
				if (e.type == 'success')
				{
					AboutPage.formSuccess()
				}
				else
				{
					alert('Произошла ошибка! Пожалуйста, сообщите о ней по адресу support@inshaker.ru')
				}
			}
			
			Request.post(this.action, FormHelper.toHash(this), sent)
		}
		form.addEventListener('submit', sendListener,  false)
	}
};

$.onready(function(){
	AboutPage.init();
	new RollingImagesLite($('rolling_stats'), {animationType: 'directJump'});
})

<!--# include virtual="/lib-0.3/modules/form-helper.js" -->
<!--# include virtual="/lib-0.3/modules/url-encode.js" -->
<!--# include virtual="/lib-0.3/modules/request.js" -->

<!--# include virtual="/lib-0.3/modules/location-hash.js" -->
<!--# include virtual="/lib-0.3/modules/motion.js" -->
<!--# include virtual="/lib-0.3/modules/motion-types.js" -->
<!--# include virtual="/lib-0.3/modules/animation.js" -->
<!--# include virtual="/js/common/rolling-images.js" -->

<!--# include virtual="/js/common/switcher.js" -->

<!--# include virtual="swfobject.js" -->

