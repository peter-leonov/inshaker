function GiftsModel (view)
{
    this.initialize = function (filters)
    {
		this.DEFAULT_CITY = "Москва"

		var initialCity  = this.DEFAULT_CITY
		var initialGift  = Gift.getByCity(initialCity).sort(Gift.orderSort)[0]
		
		if(filters && filters.city)
        {
			initialCity  = Gift.cityExists(filters.city) ? filters.city : null
			initialGift  = Gift.getByCityName(filters.city, filters.gift) 
		}
		view.initialize(Gift.getByCity(initialCity).sort(Gift.orderSort), initialGift)
	};

}
