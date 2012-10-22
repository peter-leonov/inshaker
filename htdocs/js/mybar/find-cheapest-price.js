;(function(){
var f = function(ingredient, v)
{
	var ingredientVolumes = ingredient.volumes
	ingredientVolumes.map(function(a){ a.nominalPrice = a[1]/a[0] })
	ingredientVolumes.sort(function(a, b){ return b.nominalPrice - a.nominalPrice })
	
	var last = ingredientVolumes.length - 1
	
	var minNominal = ingredientVolumes[0].nominalPrice
	
	var bottleVolume = ingredientVolumes[last][0]
	var bottles = Math.ceil(v / bottleVolume)
	var pricePerBottle = ingredientVolumes[last][1]
	var volume = bottles * bottleVolume
	var totalPrice = bottles * pricePerBottle
	var minPrice = totalPrice
	var returnObj = { bottles : [], price : minPrice, addingBottles : { amount : bottles, vol : bottleVolume, pricePerBottle : pricePerBottle } }
	
	
	var entries = 0,
		maxEntries = f.maxEntries
	
	var appendBottles = function (currentVolume, currentPrice, start, bottles, addingBottles)
	{
		for (var i = start, il = ingredientVolumes.length; i < il; i++) 
		{
			// set restriction for recursion
			if (++entries >= maxEntries)
				throw new Error('More than ' + entries + ' entries while finding cheapest price for volume ' + v + ' with bottles: ' + ingredientVolumes.join(', '))
			
			var volumeObj = ingredientVolumes[i]
			var vol = currentVolume
			var tbottles = addingBottles
			var temporyPrice = currentPrice
			
			while(tbottles > 0 && v - vol < volumeObj[0] && i != last)
			{
				vol -= bottleVolume
				tbottles--
				temporyPrice -= pricePerBottle
			}
			
			var tprice = temporyPrice + volumeObj[1]
			
			if(tprice < minPrice)
			{
				var currBottles = bottles.slice()
				currBottles.push(volumeObj)
				var tvol = vol + volumeObj[0]
				
				if(tvol < v)
				{
					appendBottles(tvol, tprice, i, currBottles, tbottles)
				}
				else
				{
					returnObj = { bottles : currBottles, price : tprice, addingBottles : { amount : tbottles, vol : bottleVolume, pricePerBottle : pricePerBottle } }
					minPrice = tprice
				}
			}
		}
	}
	
	try // to return last useful result
	{
		appendBottles(volume, minPrice, 0, [], bottles)
	}
	catch (ex)
	{
		// defered exception raising
		window.setTimeout(function () { throw ex }, 0)
	}
	
	returnObj.entries = entries
	return returnObj
}

f.maxEntries = 100

window['findCheapestPrice'] = f
})()
