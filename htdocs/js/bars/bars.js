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
		
		Switcher.init($('switch-view'), [$('bars-list'), $('bars-map')])
	}
)