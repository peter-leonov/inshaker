var BarsController =
{
	state: {city: undefined, format: undefined, feel: undefined},
	
	initialize: function (db, state)
	{
		this.state = state
		if (location.hash.length > 1)
			log(Object.extend(this.state, UrlEncode.parse(location.hash)))
		
		BarsModel.initialize(db, this.state)
		
		log(this.state)
		BarsModel.setState(this.state)
	},
	
	viewTypeSwitched: function (type)
	{
		this.state.view = type
		BarsModel.setState(this.state)
		this.setHashParam('view', type)
	},
	
	setHashParam: function (key, val)
	{
		var hash = UrlEncode.parse(location.hash)
		hash[key] = val
		location.hash = UrlEncode.stringify(hash)
	},
	
	citySelected: function (val)
	{
		this.state.city = val
		this.state.format = undefined
		this.state.feel = undefined
		
		this.setHashParam('city', val);
		BarsModel.setState(this.state)
	},
	formatSelected: function (val)
	{
		this.state.format = val
		this.state.feel = undefined
		
		this.setHashParam('format', val)
		BarsModel.setState(this.state)
	},
	feelSelected: function (val)
	{
		this.state.feel = val
		
		this.setHashParam('feel', val)
		BarsModel.setState(this.state)
	}
}

