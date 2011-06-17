<!--# include virtual="/js/common/storage.js" -->
<!--# include virtual="/lib-0.3/modules/url-encode.js"-->
<!--# include virtual="/lib-0.3/modules/request.js"-->

;(function(){

var myName = 'BarStorage'

Me =  
{
	initialize : function()
	{
		this.data = 
		{
			remote :
			{
				barName : '',
				ingredients : [],
				ingredientsShowType : 'by-list',
				cocktailsShowType : 'by-pics',
				hiddenCocktails : [],
				currentTag : '',
				purchasePlanNotices : {},
				purchasePlanVolumes : {},
				purchasePlanExcludes : {}
			},
			local :
			{
				userid : '',
				hash : ''
			}
		}
		
		if(!Storage)
			Storage = new ClientStorage()
	},
	
	initBar : function(callback)
	{
		var me = this
		
		if(this.inited)
		{
			callCallback()
			return
		}
		
		Storage.init(init)
		
		function callCallback()
		{
			callback(me.data.remote, me.data.local.userid, me.newbie)
		}
		
		function init()
		{
			var json = ''
			try
			{
				json = Storage.get('mybar')
			}
			catch(e)
			{
				log('Can\'t get mybar object.', e)
			}
			
			parsingJson = JSON.parse(json)
			if(parsingJson)
			{
				me.newbie = false
				Object.extend(me.data.local, parsingJson)
				me.remoteGet(me.data.local.userid, remoteGetCallback)
			}
			else
			{
				me.newbie = true
				me.remoteCreate(remoteCreateCallback)
			}
			
			function remoteCreateCallback(localData)
			{
				if(localData)
				{
					Object.extend(me.data.local, localData)
					me.localSave()
				}
				callCallback()
				me.inited = true				
			}
			
			function remoteGetCallback(remoteData)
			{
				if(remoteData)
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
	
	remoteServer : 'http://' + window.location.hostname,
	
	remoteCreate : function(callback)
	{
		var url = this.remoteServer + '/mybar-foreign/createbar/'
		var me = this
		Request.post(url, JSON.stringify(this.data.remote), function(e)
		{
			if(e.type != 'success')
			{
				callback()
				return
			}
			var localData = JSON.parse(this.responseText)
			callback(localData)
		})			
	},
	
	remoteGet : function(userid, callback)
	{
		var url = this.remoteServer + '/get-bar-by-id/'
		Request.get(url + userid + '?rand=' + Math.random(), null, function(e)
		{
			log(this)
			if(e.type != 'success')
			{
				callback()
				return
			}
			var remoteData = JSON.parse(this.responseText)
			callback(remoteData)
		})		
	},
	
	remoteSave : function()
	{
		var ld = this.data.local
		if(ld.userid)
		{
			var url = this.remoteServer + '/mybar-foreign/savebar/'
			Request.post(
				url + ld.hash + '/' + ld.userid,
				JSON.stringify(this.data.remote),
				function(){}
			)		
		}	
	},
	
	localSave : function()
	{
		var json = JSON.stringify(this.data.local)
		try
		{
			Storage.put('mybar', json)
		}
		catch(e)
		{
			log('Can\'t put mybar object.', e)
		}
	},
	
	saveBar : function(bar)
	{
		
		Object.extend(this.data.remote, bar)
		this.remoteSave()
	},
	
	addIngredient : function(ingredientName)
	{
		var ings = this.data.remote.ingredients
		if(ings.indexOf(ingredientName) == -1)
		{
			ings.push(ingredientName)
		}
		else
		{
			return false
		}
		this.saveBar()
		return true
	},
	
	removeIngredient : function(ingredientName)
	{
		var ings = this.data.remote.ingredients
		var pos = ings.indexOf(ingredientName)
		if(pos != -1)
		{
			ings.splice(pos, 1)
		}
		else
		{
			return false
		}
		this.saveBar()
		return true
	},
	
	haveIngredient : function(ingredientName)
	{
		if(this.data.remote.ingredients.indexOf(ingredientName) != -1)
		{
			return true
		}
		return false
	}
}

Me.className = myName
self[myName] = Me

})();

BarStorage.initialize()