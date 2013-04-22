;(function(){

var myName = 'BarStorage'

Me =  
{
	initialize: function ()
	{
		this.data = 
		{
			remote:
			{
				barName: '',
				ingredients: [],
				ingredientsShowType: 'by-list',
				cocktailsShowType: 'by-pics',
				hiddenCocktails: [],
				currentTag: '',
				purchasePlanNotices: {},
				purchasePlanVolumes: {},
				purchasePlanExcludes: {}
			},
			local:
			{
				id: '',
				hash: ''
			}
		}
	},
	
	initBar: function (callback)
	{
		var me = this
		
		if (this.inited)
		{
			callCallback()
			return
		}
		
		clientStorage.ready(init)
		
		function callCallback ()
		{
			callback(me.data.remote, me.data.local.id, me.newbie)
		}
		
		function init ()
		{
			var json = clientStorage.get('mybar')
			
			try
			{
				var localData = JSON.parse(json)
			}
			catch (ex) { log(ex) }
			
			if (localData)
			{
				me.newbie = false
				Object.extend(me.data.local, localData)
				me.remoteGet(me.data.local.id, remoteGetCallback)
			}
			else
			{
				me.newbie = true
				me.remoteCreate(remoteCreateCallback)
			}
			
			function remoteCreateCallback(localData)
			{
				if (localData)
				{
					Object.extend(me.data.local, localData)
					me.localSave()
				}
				callCallback()
				me.inited = true
			}
			
			function remoteGetCallback(remoteData)
			{
				if (remoteData)
				{
					Object.extend(me.data.remote, remoteData)
					callCallback()
					me.inited = true
				}
				else
				{
					me.remoteCreate(remoteCreateCallback)
				}
			}
		}
	},
	
	storagePath: '/storage/v1/',
	
	remoteCreate: function (callback)
	{
		var url = this.storagePath + 'create/'
		var me = this
		Request.post(url, JSON.stringify(this.data.remote), function ()
		{
			if (this.statusType != 'success')
				throw new Error('BarStorage: failed to create a new bar')
			
			var localData = JSON.parse(this.responseText)
			callback(localData)
		})
	},
	
	remoteGet: function (id, callback)
	{
		var url = this.storagePath + 'get/'
		Request.get(url + id + '/bar?rand=' + Math.random(), null, function ()
		{
			if (this.statusType == 'success')
				var remoteData = JSON.parse(this.responseText)
			
			callback.call(this, remoteData)
		})
	},
	
	remoteSave: function ()
	{
		var ld = this.data.local
		if (!ld.id)
			return
		
		var url = this.storagePath + 'save/'
		Request.post(url + ld.hash + '/' + ld.id, JSON.stringify(this.data.remote), function ()
		{
			if (this.statusType != 'success')
			{
				clientStorage.remove('mybar')
				throw new Error('BarStorage: failed to save the bar')
			}
		})
	},
	
	localSave: function ()
	{
		clientStorage.set('mybar', JSON.stringify(this.data.local))
	},
	
	saveBar: function (bar)
	{
		Object.extend(this.data.remote, bar)
		this.remoteSave()
	},
	
	addIngredient: function (ingredientName)
	{
		var ings = this.data.remote.ingredients
		
		if (ings.indexOf(ingredientName) != -1)
			return false
		
		ings.push(ingredientName)
		this.saveBar()
		return true
	},
	
	removeIngredient: function (ingredientName)
	{
		var ings = this.data.remote.ingredients
		var pos = ings.indexOf(ingredientName)
		if (pos == -1)
			return false
		
		ings.splice(pos, 1)
		this.saveBar()
		return true
	},
	
	haveIngredient: function (ingredientName)
	{
		return this.data.remote.ingredients.indexOf(ingredientName) != -1
	}
}

Me.className = myName
self[myName] = Me

})();

BarStorage.initialize()