var BarsController =
{
	initialize: function (db)
	{
		BarsModel.initialize(db)
	},
	
	citySelected: function (val) { BarsModel.setCity(val) },
	formatSelected: function (val) { BarsModel.setFormat(val) },
	feelSelected: function (val) { BarsModel.setFeel(val) }
}
