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
			'Мохито',
			'Космополитен',
			'Маргарита',
			'Ирландский кофе',
			'Джин Тоник',
			'Кир Рояль',
			'Дайкири',
			'Черный русский',
			'Текила Санрайз',
			'Кайпиринья',
			'Б-52',
			'Глинтвейн',
			'Секс на пляже',
			'Самбука',
			'Кровавая Мэри',
			'Лонг Айленд Айс Ти'
		]
		
		var data =
		{
			cocktails: cocktails.map(function (v) { return Cocktail.getByName(v) })
		}
		
		this.view.modelChanged(data)
	}
}
