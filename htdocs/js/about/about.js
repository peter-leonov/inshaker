var AboutPage = {
	formSuccess: function(){
		$('#feedback_form').hide();
		$('#form_success').show();
	},
	
	formShow: function(){
		$('#form_success').hide();
		$('#feedback_form').show();
	},
	
	hidePoster: function(){
		$('#panel_cocktail').style.marginBottom = "0";
		$('#poster').style.display = "none";
	},
	
	showPoster: function(){
		$('#panel_cocktail').style.marginBottom = "142px";
		$('#poster').style.display = "block";
	},
	
	init: function (cities, visitors)
	{
		var main = $('#menu')
		var tabs = $$('#main-column .content')
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
		
		locationHash.addEventListener('change', function () { window.scrollTo(0, 0); sw.select(hrefs.indexOf(this.get())) }, false)
		
		this.statCities = $('#stat_cities')
		this.statVisits = $('#stat_visits')
		this.cities = cities
		this.visitors = visitors
		
		var form = $('#feedback_form')
		function sendListener (e)
		{
			e.preventDefault()
			
			function sent ()
			{
				if (this.statusType == 'success')
				{
					AboutPage.formSuccess()
				}
				else
				{
					alert('Произошла ошибка! Пожалуйста, сообщите о ней по адресу support@inshaker.ru')
				}
			}
			
			var h = FormHelper.toHash(this)
			
			var message =
			{
				subject: 'Предложение или вопрос по иншейкеру',
				body: 'Имя: ' + h.name + '<br/>Контакт: ' + h.address + '<br/>Компания: ' + h.company + '<br/>Что говорит: ' + h.text
			}
			
			Request.post(this.action, message, sent)
		}
		form.addEventListener('submit', sendListener, false)
		
		
		var content = $('#partner-list')
		
		var marks = Mark.getAll()
		for (var i = 0; i < marks.length; i++)
		{
			var mark = marks[i]
			
			var span = document.createElement('li')
			span.className = 'partner-item'
			span.innerHTML = '<a class="partner-link" href="' + mark.combinatorLink() + '"><img class="partner-image" src="' + mark.getBannerSrc() + '"></a>'
			content.appendChild(span)
			content.appendChild(document.createTextNode(' '))
		}
		
		var spacer = document.createElement('span')
		spacer.className = 'spacer'
		content.appendChild(spacer)
	},
	
	drawCharts: function ()
	{
		var visual = google.visualization
		
		var dataPie = new visual.DataTable()
		dataPie.addColumn('string', 'City')
		dataPie.addColumn('number', 'Slices')
		dataPie.addRows(this.cities)
		
		var optionsPie = {
			width: 510,
			height: 400,
			chartArea:
			{
				left: 15,
				width: 1000
			}
		}
		
		var chartPie = new visual.PieChart(this.statCities)
		chartPie.draw(dataPie, optionsPie)
		
		
		var dataArea = new visual.DataTable()
		dataArea.addColumn('string', 'Дата')
		dataArea.addColumn('number', 'Просмотры')
		dataArea.addColumn('number', 'Визиты')
		dataArea.addRows(this.visitors)
		
		var optionsArea = {
			focusTarget: 'category',
			width: 510,
			height: 400,
			legend:
			{
				position: 'bottom',
				alignment: 'center'
			},
			chartArea:
			{
				left: 95,
				width: 370
			}
		}
		
		var chartArea = new visual.AreaChart(this.statVisits)
		chartArea.draw(dataArea, optionsArea)
	}
};

$.onready(function(){
	AboutPage.init(<!--# include virtual="/stat/cities/data.json" -->, <!--# include virtual="/stat/visitors/data.json" -->);
	new RollingImagesLite($('#rolling_stats'), {animationType: 'directJump'});
})

<!--# include virtual="/liby/modules/form-helper.js" -->
<!--# include virtual="/liby/modules/url-encode.js" -->

<!--# include virtual="/liby/modules/location-hash.js" -->
<!--# include virtual="/liby/modules/motion.js" -->
<!--# include virtual="/liby/modules/motion-types.js" -->
<!--# include virtual="/liby/modules/animation.js" -->
<!--# include virtual="/js/common/rolling-images.js" -->

<!--# include virtual="/js/event/switcher.js" -->
