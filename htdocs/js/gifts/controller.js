function GiftsController (model, view)
{
    this.initialize = function ()
    {
        view.controller = this
        model.initialize(this.filtersFromRequest())
    }

    this.goToGift = function (gift)
    {
        window.location.href = gift.getPageHref()
    }
    	
    this.filtersFromRequest = function ()
    {
		var address = window.location.href
		var match = address.match(/.+\?(.+)/)
		if(match)
        {
			var params = match[1].split("&")
			var filters = {}
			for(var i = 0; i < params.length; i++) 
            {
				var pair = params[i].split("=")
				filters[pair[0]]=decodeURIComponent(pair[1])
			}
			return filters
		} else return null
	}
    
    this.initialize()
}
