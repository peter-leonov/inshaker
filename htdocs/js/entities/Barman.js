function Barman (data)
{
	for (var k in data)
		this[k] = data[k]
	
	var cocktails = this.cocktails
	if (!cocktails)
		this.cocktails = []
	else
		for (var i = 0, il = cocktails.length; i < il; i++)
			cocktails[i] = Cocktail.getByName(cocktails[i])
}

Barman.prototype =
{
	constructor: Barman,
    
    switchable: true,
    render: function (context)
    {
		Statistics.barmanPopupViewed(this)
        var name = context.getElementsByTagName("h1")[0].firstChild
        name.innerHTML = this.name
        
        var img  = context.getElementsByClassName("photo")[0]
        img.style.backgroundImage  = "url(/i/barmen/" + this.name_eng.htmlName() + ".jpg)"
        img.alt  = this.name
           
        var body = context.getElementsByClassName("desc")[0]
        body.empty()
        for(var i = 0; i < this.desc.length; i++)
        {
            var p = document.createElement("p")
            p.innerHTML = this.desc[i]
            body.appendChild(p)
        }
        
        var parent  = context.getElementsByClassName('programica-rolling-images')[0]
       
		if(this.cocktails)
        {
            if(!parent.RollingImagesLite) 
                new Programica.RollingImagesLite(parent, {animationType: 'easeInOutCubic'})
            var surface = context.getElementsByClassName('surface')[0]
            surface.empty()
            parent.show()
            for (var i = 0; i < this.cocktails.length; i++)
		    {
			    if (i % 6 === 0)
			    {
				    var point = document.createElement('ul')
				    point.className = 'point'
				    surface.appendChild(point)
			    }
				var cocktail = Cocktail.getByName(this.cocktails[i])
				if (cocktail)
					point.appendChild(cocktail.getPreviewNode())
		    }
		    parent.RollingImagesLite.sync()
            parent.RollingImagesLite.goInit()
        } 
        else parent.hide()
    },

    next: function () { return Barman.barmen[Barman.barmen.indexOf(this) + 1] },
    prev: function () { return Barman.barmen[Barman.barmen.indexOf(this) - 1] }
}

Object.extend(Barman,
{
	initialize: function (db)
	{
		for(var i = 0; i < db.length; i++)
			db[i] = new Barman(db[i])
		
		this.db = db
	},
	
	getByName: function (name)
	{
		var db = this.db
		
		for (var i = 0, il = db.length; i < il; i++)
		{
			var barman = db[i]
			if (barman.name == name)
				return barman
		}
		
		return null
	},
	
	getByCocktailName: function (name)
	{
		var db = this.db
		
		for (var i = 0, il = db.length; i < il; i++)
		{
			var barman = db[i]
			if (barman.cocktails.indexOf(name) != -1)
				return barman
		}
		
		return null
	}
})

Barman.initialize(<!--# include file="/db/barmen.js"-->)
