var BarsController =
{
	initialize: function (db)
	{
		BarsModel.initialize(db)
	},
	
	viewSwitched: function (num)
	{
		BarsModel.setViewType(num)
	},
	
	citySelected: function (val) { BarsModel.setCity(val) },
	formatSelected: function (val) { BarsModel.setFormat(val) },
	feelSelected: function (val) { BarsModel.setFeel(val) }
}
