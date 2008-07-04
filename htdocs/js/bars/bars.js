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
		Switcher.bind($('switch-view'), [$('bars-container'), $('map')])
		
		var citySelect = Selecter.bind($('bars-city'))
		var formatSelect = Selecter.bind($('bars-format'))
		var feelSelect = Selecter.bind($('bars-feel'))
		
		var nodes =
		{
			barsContainer: $('bars-container'),
			citySelect: citySelect,
			formatSelect: formatSelect,
			feelSelect: feelSelect
		}
		Bars.init(bars_db, nodes)
	}
)