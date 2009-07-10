Gift = function (data)
{
	for (var k in data)
		this[k] = data[k]
}

Gift.prototype =
{
	constructor: Gift,
    
    getImgSrc: function (postfix)
    {
		return "/i/gift/" + this.city.trans().htmlName() + "/" + this.name.trans().htmlName() + postfix;
	},
	
	getMiniImgSrc: function ()
    {
		return this.getImgSrc("-mini.jpg");
	},
	
	getPageHref: function(){
		return "/gifts.html?city="+encodeURIComponent(this.city)+"&gift="+encodeURIComponent(this.name);
	}
}

Object.extend(Gift,
{
    gifts: [],

    initialize: function (db_gifts)
    {
	    for(var i = 0; i < db_gifts.length; i++)
        {
			this.gifts.push(new Gift(db_gifts[i]));
		}
	},

    getAll: function () { return this.gifts },
    
    getByCityName: function (city, name)
    {
        var byCity = this.getByCity(city)

        for (var i = 0; i < byCity.length; i++)
        {
            if(byCity[i].name == name) return byCity[i]
        }
        return null
    },
    
    getByCity: function (city)
    {
        var res = []
        for (var i = 0; i < this.gifts.length; i++)
        {
            if (this.gifts[i].city == city) res.push(this.gifts[i])
        }
        return res
    },
    
    cityExists: function (city)
    {
        for (var i = 0; i < this.gifts.length; i++)
        {
            if(this.gifts[i].city == city) return true
        }
        return false
    },

    orderSort: function (a, b)
    {
        if (a.order > b.order) return 1
        else if (a.order == b.order) return 0
        else return -1
    }
})

Gift.initialize(<!--# include file="/db/gifts.js"-->)
