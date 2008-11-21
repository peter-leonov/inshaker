function IndexPageModel ()
{
	IndexPageModel.name = "IndexPageModel"
	this.constructor = IndexPageModel
	this.initialize.apply(this, arguments)
}

IndexPageModel.prototype =
{
	initialize: function () { },
	
	setState: function (state)
	{
		var cocktails =
		[
			'Глинтвейн',
			'Грог',
      'Ирландский кофе',
		]
		
		var data =
		{
			cocktails: cocktails.map(function (v) { return Cocktail.getByName(v) })
		}
		
		this.view.modelChanged(data)
	}
}
