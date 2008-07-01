var BarsModel =
{
	initialize: function (db)
	{
		this.db = db
		BarsView.modelChanged(this._getAllCurrentBars())
	},
	
	_getAllCurrentBars: function ()
	{
		return this.db
	}
}
