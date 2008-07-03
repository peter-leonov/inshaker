var BarsModel =
{
	initialize: function (db)
	{
		this.db = db
		BarsView.modelChanged(this._getAllCurrentBars())
		BarsView.renderCities(this._getAllCities())
		BarsView.renderFormats(this._getAllFormats())
		BarsView.renderFeels(this._getAllFeels())
	},
	
	_getAllCurrentBars: function ()
	{
		return this.db
	},
	
	_getAllCities: function ()
	{
		return ['Москва', 'Санкт-Петербург', 'Омск', 'Волгоград', 'Казань', 'Челябинск',
		'Новосибирск', 'Ростов', 'Набережные Челны', 'Комсомольск-на-Амуре']
	},
	
	_getAllFormats: function ()
	{
		return ['любой формат', 'лаундж', 'тупняк', 'рейв', 'спорт']
	},
	
	_getAllFeels: function ()
	{
		return ['любая атмосфера', 'стриптиз', 'вид', 'мягкая мебель', 'большой экран']
	}
}
