//Sorry for old lib. It's needed for Storage (hard code in it)
<!--# include virtual="/lib/Programica/UA.js" -->

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
			showIngByGroups : false
		}
	},
	
	getBar : function(callback)
	{
		var me = this
		Storage.init(function(){
			try
			{
				Object.extend(me.bar, JSON.parse(Storage.get('mybar')))
			}
			catch(e)
			{
				
			}
				
			if(callback)
				callback(me.bar)	
		})
	},
	
	saveBar : function(bar)
	{
		if(!bar)
			bar = this.bar
		else
			this.bar = bar
			
			for (var k in Storage) 
			{
				log(k, Storage[k])
			}
			
		try
		{
			Storage.put('mybar', JSON.stringify(bar))
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
			
		this.saveBar()
	},
	
	removeIngredient : function(ingredientName)
	{
		var ings = this.bar.ingredients
		var pos = ings.indexOf(ingredientName)
		if(pos != -1)
			ings.splice(pos, 1)
			
		this.saveBar()
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