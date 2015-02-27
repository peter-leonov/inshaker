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
		
		visitors.pop()
		for (var i = 0, il = visitors.length; i < il; i++)
		{
			visitors[i][0] = new Date( visitors[i][0] * 1000 ).toRusDateShort()
			
			var temp = visitors[i][1]
			visitors[i][1] = visitors[i][2]
			visitors[i][2] = temp
		}
		
		var rusCities =
		{
			'Moscow': 'Москва',
			'Sankt-Petersburg': 'Санкт-Петербург',
			'Sverdlovskaya oblast': 'Свердловская область',
			'Moskovskaya oblast': 'Московская область',
			'Rostovskaya oblast': 'Ростовская область',
			'Kyiv': 'Киев',
			'Novosibirskaya oblast': 'Новосибирская область',
			'Krasnodarskiy kray': 'Краснодарский край',
			'Samarskaya oblast': 'Самарская область',
			'Nizhegorodskaya oblast': 'Нижегородская область',
			'Chelyabinskaya oblast': 'Челябинская область',
			'Tatarstan, Republic': 'Республика Татарстан'
			// 'Primorskiy kray': 'Приморский край',
			// 'Voronezhskaya oblast': 'Воронежская область',
			// 'Volgogradskaya oblast': 'Волгоградская область',
			// 'Krasnoyarskiy kray': 'Красноярский край'
		}
		
		var totalVisits = cities.pop().total.visits
		var totalUsed = 0
		var newCities = []
		
		for (var i = 0, il = cities.length; i < il; i++)
		{
			var city = cities[i],
				rus = rusCities[city[0]]
			
			if (!rus)
				continue
			
			var count = city[1]
			totalUsed += count
			newCities.push([rus, count])
		}
		
		newCities.push(['Другие регионы', totalVisits - totalUsed])
		cities = newCities
		
		this.statCities = $('#stat_cities')
		this.statVisits = $('#stat_visits')
		this.cities = cities
		this.visitors = visitors
		
		var opts =
		{
			packages: ["corechart"]
		}
		
		var me = this
		googleApiLoader.addEventListener('visualization', function (e) { me.drawCharts(e) }, false)
		googleApiLoader.load('visualization', 1, opts)
		
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
				to: 'about@mg.inshaker.ru',
				from: 'About Page <about@mg.inshaker.ru>',
				html: 'Имя: ' + h.name + '<br/>Контакт: ' + h.address + '<br/>Компания: ' + h.company + '<br/>Что говорит: ' + h.text
			}
			
			Mail.send(message, sent)
		}
		form.addEventListener('submit', sendListener, false)
		
		// this.renderPartners()
	},
	
	renderPartners: function ()
	{
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
		
		var optionsPie =
		{
			width: 510,
			height: 500,
			chartArea:
			{
				top: 35,
				left: 15,
				width: 1000
			},
			legend:
			{
				position: 'right',
				alignment: 'center'
			}
		}
		
		var chartPie = new visual.PieChart(this.statCities)
		chartPie.draw(dataPie, optionsPie)
		
		
		var dataArea = new visual.DataTable()
		dataArea.addColumn('string', 'Дата')
		dataArea.addColumn('number', 'Просмотры')
		dataArea.addColumn('number', 'Посетители')
		dataArea.addRows(this.visitors)
		
		var optionsArea =
		{
			focusTarget: 'category',
			width: 510,
			height: 400,
			hAxis:
			{
				textStyle:
				{
					fontSize: 11
				},
				showTextEvery: (this.visitors.length/6) + 2,
				maxAlternation: 2,
				maxTextLines: 2,
				minTextSpacing: 0
			},
			vAxis:
			{
				textStyle:
				{
					fontSize: 11
				},
				gridlines:
				{
					count: 8
				}
			},
			legend:
			{
				position: 'bottom',
				alignment: 'center'
			},
			chartArea:
			{
				top: 35,
				left: 50,
				width: 450
			}
		}
		
		var chartArea = new visual.AreaChart(this.statVisits)
		chartArea.draw(dataArea, optionsArea)
	}
};

$.onready(function(){
  UserAgent.setupDocumentElementClassNames()
	AboutPage.init(<!--# include virtual="/db/stats/cities.json" -->, <!--# include virtual="/db/stats/visits.json" -->);
})

<!--# include virtual="/liby/modules/form-helper.js" -->

<!--# include virtual="/liby/modules/location-hash.js" -->

<!--# include virtual="/js/event/switcher.js" -->

<!--# include virtual="/liby/modules/google-api-loader.js" -->
<!--# include virtual="/js/common/google.js" -->
