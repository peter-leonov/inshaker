<!--# include virtual="/js/common/storage.js" -->
<!--# include virtual="/lib-0.3/modules/url-encode.js"-->
<!--# include virtual="/lib-0.3/modules/request.js"-->

;(function(){

var myName = 'BarStorage'

Me =  
{
	remoteServer : 'http://' + window.location.hostname + '/mybar-foreign/',
	
	initialize : function()
	{
		this.bar = 
		{  
			barName : '',
			ingredients : [],
			ingredientsShowType : 'by-list',
			cocktailsShowType : 'by-pics',
			//notAvailableCocktails : {},
			hiddenCocktails : [],
			currentTag : '',
			purchasePlanNotices : {},
			purchasePlanVolumes : {},
			purchasePlanExcludes : {},
			foreignData : { userid : '', hash : ''}
		}
		
		if(!Storage)
			Storage = new ClientStorage()
	},
	
	initBar : function(callback)
	{
		if(this.inited)
		{
			callback(this.bar)
			return
		}
		
		var me = this
		
		var f = function(){
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
			me.newbie = parsingJson ? false : true
			Object.extend(me.bar, parsingJson)
			
			if(callback)
				callback(me.bar, me.newbie)
				
			me.inited = true
		}
		
		Storage.init(f)
	},
	
	saveBar : function(bar, noRemoteSave)
	{
		if(!bar)
			bar = this.bar
		else
			Object.extend(this.bar, bar)

		var json = JSON.stringify(this.bar)
			
		try
		{
			Storage.put('mybar', json)
		}
		catch(e)
		{
			log('Can\'t put mybar object.', e)
		}
		
		if(!noRemoteSave)
			this.saveRemote()
	},
	
	addIngredient : function(ingredientName)
	{
		var ings = this.bar.ingredients
		if(ings.indexOf(ingredientName) == -1)
			ings.push(ingredientName)
		else
			return false
			
		this.saveBar()
		return true
	},
	
	removeIngredient : function(ingredientName)
	{
		var ings = this.bar.ingredients
		var pos = ings.indexOf(ingredientName)
		if(pos != -1)
			ings.splice(pos, 1)
		else
			return false
			
		this.saveBar()
		return true
	},
	
	haveIngredient : function(ingredientName)
	{
		if(this.bar.ingredients.indexOf(ingredientName) != -1)
			return true
			
		return false
	},
	
	getForeignLink : function(callback)
	{
		var url = this.remoteServer + 'createbar/'
		var me = this
		Request.post(url, JSON.stringify(this.bar), function(e)
		{
			if(e.type != 'success')
				return
			var foreignData = JSON.parse(this.responseText)
			Object.extend(me.bar.foreignData, foreignData)
			me.saveBar(false, true)
			callback(me.bar.foreignData)
		})
	},
	
	saveRemote : function()
	{
		var fd = this.bar.foreignData
		if(!fd.userid)
			return
			
		Request.post(this.remoteServer + 'savebar/' + fd.hash + '/' + fd.userid, JSON.stringify(this.bar), function(){})
	}
}

Me.className = myName
self[myName] = Me

})();

BarStorage.initialize()