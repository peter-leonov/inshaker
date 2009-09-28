Barman = function (data)
{
	for (var k in data)
		this[k] = data[k]
}
/**
 * Каждый экземпляр соответствует интерфейсу displayObject в InfoPopup
 *
 * @see "/js/common/infoPopup.js"
 */
Barman.prototype =
{
	constructor: Barman,
    
    switchable: true,
    render: function (context)
    {
        var head = context.getElementsByTagName("h1")[0]
        head.innerHTML = this.name + " – клуб главных барменов Inshaker"
        
        var img  = context.getElementsByClassName("photo")[0]
        img.src  = "/i/barmen/" + this.name_eng.htmlName() + ".jpg"
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
    barmen: [],

    initialize: function (db) 
    {
        for(var i = 0; i < db.length; i++)
        {
			this.barmen.push(new Barman(db[i]))
		}      
    },

    getByName: function (name)
    {
        for(var i = 0; i < this.barmen.length; i++)
            if (this.barmen[i].name == name) return this.barmen[i]
        return null
    },

    getByCocktailName: function (cocktailName)
    {
        for(var i = 0; i < this.barmen.length; i++)
        {
            if(this.barmen[i].cocktails && 
                    this.barmen[i].cocktails.indexOf(cocktailName) > -1)
                return this.barmen[i]
        }
        return null
    }
})

Barman.initialize(<!--# include file="/db/barmen.js"-->)
