;(function(){

var myName = 'BarStorage'

function Me ()
{

}

Object.extend(Me, 
{
	initialize : function()
	{
		this.bar = 
		{  
			ingredients : [],
			showPhotos : true,
			barName : '',
			showByCocktails : true,
			notAvailableCocktails : {},
			showIngByGroups : false,
			currentTag : ''
		}
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
			try
			{
				Object.extend(me.bar, JSON.parse(Storage.get('mybar')))
			}
			catch(e)
			{
				
			}
				
			if(callback)
				callback(me.bar)
				
			me.inited = true
		}
		
		Storage.init(f)
	},
	
	saveBar : function(bar)
	{
		if(!bar)
			bar = this.bar
		else
			Object.extend(this.bar, bar)
			
			for (var k in Storage) 
			{
				log(k, Storage[k])
			}
			
		try
		{
			Storage.put('mybar', JSON.stringify(this.bar))
		}
		catch(e)
		{
			
		}
	},
	
	addIngredient : function(ingredientName)
	{
		var ings = this.bar.ingredients
		if(ings.indexOf(ingredientName) == -1)
			ings.push(ingredientName)
		else
			return false
		
		log(this.bar)	
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
	}
})

// Me.mixIn(EventDriven)
Me.className = myName
self[myName] = Me

})();

BarStorage.initialize()