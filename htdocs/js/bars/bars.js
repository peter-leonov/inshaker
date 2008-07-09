var Bars =
{
	init: function (db, nodes)
	{
		this.view       = BarsView;
		this.model      = BarsModel;
		this.controller = BarsController;
		
		var state = {city: 'Москва', view: 'list'}
		this.view.initialize(nodes)
		this.controller.initialize(db, state)
	}
}

$.onload
(
	function ()
	{
		var viewSwitcher = Switcher.bind($('switch-view'))
		var citySelect = Selecter.bind($('bars-city'))
		var formatSelect = Selecter.bind($('bars-format'))
		var feelSelect = Selecter.bind($('bars-feel'))
		
		var nodes =
		{
			viewSwitcher: viewSwitcher,
			barsContainer: $('bars-container'),
			citySelect: citySelect,
			formatSelect: formatSelect,
			feelSelect: feelSelect,
			map: $('map')
		}
		
		// function dbInit ()
		// {
		// 	// if(!checkDbRevision())
		// 	// 	Storage.clear()
		// 	
		// 	var barsState = Storage.get('bars::state')
		// 	if(barsState)
		// 	{
		// 		barsState = eval('('+barsState+')')
		// 		log(barsState)
		// 	}
		// 	
		// 	BarsModel.initialize(db)
		// }
		// Storage.init(dbInit)
		
		Bars.init(bars_db, nodes)
	}
)