;(function(){

var Me = Papa.View

eval(NodesShortcut.include())

var myProto =
{
	initialize: function ()
	{
		this.nodes = {}
	},
	
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		
		this.scrolledStartY = nodes.brandedImageHolder.offsetTop
		window.addEventListener('scroll', function (e) { me.onBrandingScroll() }, false)
		
		return this
	},
	
	onBrandingScroll: function ()
	{
		var page = this.nodes.page
		
		var scrolled = window.pageYOffset > this.scrolledStartY
		if (this.brandingScrolled == scrolled)
			return
		this.brandingScrolled = scrolled
		
		log('toggle')
		page.toggleClassName('scrolled', scrolled)
	}
}

Object.extend(Me.prototype, myProto)

})();
