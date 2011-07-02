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
				userid: '',
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
			callback(me.data.remote, me.data.local.userid, me.newbie)
		}
		
		function init ()
		{
			var json = clientStorage.get('mybar')
			
			var localData = JSON.parse(json)
			if (localData)
			{
				me.newbie = false
				Object.extend(me.data.local, localData)
				me.remoteGet(me.data.local.userid, remoteGetCallback)
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
	
	remoteServer: 'http://' + window.location.hostname,
	
	remoteCreate: function (callback)
	{
		var url = this.remoteServer + '/mybar-foreign/createbar/'
		var me = this
		Request.post(url, JSON.stringify(this.data.remote), function (e)
		{
			if (e.type != 'success')
				throw new Error('BarStorage: failed to create the new bar')
			
			var localData = JSON.parse(this.responseText)
			callback(localData)
		})
	},
	
	remoteGet: function (userid, callback)
	{
		var url = this.remoteServer + '/get-bar-by-id/'
		Request.get(url + userid + '?rand=' + Math.random(), null, function (e)
		{
			if (e.type != 'success')
				throw new Error('BarStorage: failed to get the bar')
			
			var remoteData = JSON.parse(this.responseText)
			callback(remoteData)
		})
	},
	
	remoteSave: function ()
	{
		var ld = this.data.local
		if (!ld.userid)
			return
		
		var url = this.remoteServer + '/mybar-foreign/savebar/'
		Request.post(url + ld.hash + '/' + ld.userid, JSON.stringify(this.data.remote), function (e)
		{
			if (e.type != 'success')
				throw new Error('BarStorage: failed to save the bar')
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