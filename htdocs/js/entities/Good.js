;(function(){

var myName = 'Good'

eval(NodesShortcut.include())

function Me (data)
{
	for (var k in data)
		this[k] = data[k]
	this.constructor = Me
}

function lazyLoadPreview ()
{
	var url = this.lazyBackgroundImage
	if (url)
	{
		this.lazyBackgroundImage = null
		this.style.backgroundImage = url
		this.classList.remove('lazy')
	}
}

function lazyLoadPromo ()
{
	var url = this.lazySrc
	if (url)
	{
		this.lazySrc = null
		this.src = url
		this.classList.remove('lazy')
	}
}

Me.prototype =
{
	getHref: function ()
	{
		return '/good/' + this.path + '/'
	},
	
	getPreviewNode: function (lazy)
	{
		var link = Nct('a', lazy ? 'good-preview lazy' : 'good-preview', this.name)
		link.href = this.getHref()
		var backgroundImage = 'url(/good/' + this.path + '/mini.png)'
		if (lazy)
			link.lazyBackgroundImage = backgroundImage
		else
			link.style.backgroundImage = backgroundImage
		
		link.lazyLoad = lazyLoadPreview
		
		return link
	},
	
	getPromoNode: function (num, lazy)
	{
		var image = Nc('img', lazy ? 'good-promo lazy' : 'good-promo')
		
		image[lazy ? 'lazySrc' : 'src'] = '/good/' + this.path + '/promo-' + (num + 1) + '.jpg'
		
		image.lazyLoad = lazyLoadPromo
		
		return image
	}
}

var staticMethods =
{
	initialize: function (db)
	{
		for (var i = 0, il = db.length; i < il; i++)
			db[i] = new Me(db[i])
		
		this.db = db
	},
	
	bySellIndex: null,
	getBySellName: function (name)
	{
		var index = this.bySellIndex
		if (!index)
		{
			index = this.bySellIndex = {}
			
			var db = this.db
			
			for (var i = 0, il = db.length; i < il; i++)
			{
				var item = db[i],
					sell = item.sell
				
				if (!sell)
					continue
				
				for (var j = 0, jl = sell.length; j < jl; j++)
				{
					var v = sell[j]
					
					var arr = index[v]
					if (arr)
						arr.push(item)
					else
						index[v] = [item]
				}
			}
		}
		
		return index[name] || []
	},
	
	byNameIndex: null,
	getByName: function (name)
	{
		var index = this.byNameIndex
		if (!index)
		{
			index = this.byNameIndex = {}
			
			var db = this.db
			for (var i = 0, il = db.length; i < il; i++)
			{
				var item = db[i]
				index[item.name] = item
			}
		}
		
		return index[name]
	},
	
	getAll: function ()
	{
		// save the db from corruption with copying
		return this.db.slice()
	}
}

Object.extend(Me, staticMethods)

Me.className = myName
self[myName] = Me

Me.initialize(<!--# include virtual="/db/goods/goods.json"-->)

})();