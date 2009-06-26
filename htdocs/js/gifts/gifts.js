var GiftsPage = {
	initialize: function (nodes)
    {
		this.view       = new GiftsView(nodes);
		this.model      = new GiftsModel(this.view);
		this.controller = new GiftsController(this.model, this.view);
	}
};

$.onload (
	function ()
    {		
		var nodes = 
        {
		    previewsRoot: cssQuery('.gifts-previews')[0],
            promosRoot: cssQuery('.gift-promos')[0],

            previewsSurface: cssQuery('.gifts-previews .surface')[0],
            promosSurface: cssQuery('.gift-promos .surface')[0],
            fullName: $('full-name'),
            price: $('price'),
            desc: $('desc'),
            places: $('places')            
        }
		GiftsPage.initialize(nodes);
	}
)

<!--# include file="/js/gifts/model.js" -->
<!--# include file="/js/gifts/controller.js" -->
<!--# include file="/js/gifts/view.js" -->
