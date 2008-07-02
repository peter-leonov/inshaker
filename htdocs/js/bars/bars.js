var Bars =
{
	init: function (db, nodes)
	{
		this.view       = BarsView;
		this.model      = BarsModel;
		this.controller = BarsController;
		
		this.view.initialize(nodes)
		this.controller.initialize(db)
	}
}

$.onload
(
	function ()
	{
		var nodes =
		{
			barsContainer: $('bars-container')
		}
		Bars.init(bars_db, nodes)
		
		Switcher.bind($('switch-view'), [$('bars-list'), $('bars-map')])
		
		var citySelect = Selecter.bind($('bars-city'))
		citySelect.setOptions(['Москва', 'Санкт-Петербург', 'Омск', 'Волгоград', 'Казань', 'Челябинск', 'Новосибирск', 'Ростов', 'Набережные Челны', 'Комсомольск-на-Амуре'])
		citySelect.select(0)
		
		Selecter.bind($('bars-feel')).select(0)
		Selecter.bind($('bars-feature')).select(0)
	}
)