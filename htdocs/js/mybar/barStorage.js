;(function(){

var myName = 'barStorage'

function Me ()
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
}

Me.prototype =
{
	getBar : function(callback)
	{
		try
		{
			Object.extend(this.bar, JSON.parse(Storage.get('mybar')))
		}
		catch(e)
		{
			
		}
		
		if(callback)
			callback(this.bar)
	},
	
	saveBar : function(bar)
	{
		if(!bar)
			bar = this.bar
		else
			this.bar = bar
		
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
			ing.splice(pos, 1)
			
		this.saveBar()
	}
	
	
}

// Me.mixIn(EventDriven)
Me.className = myName
self[myName] = Me

})();