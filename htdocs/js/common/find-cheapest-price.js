var findCheapestPrice = function(ingredient, v)
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
	
	appendBottles(volume, minPrice, 0, [], bottles)
	
	function appendBottles(currentVolume, currentPrice, start, bottles, addingBottles)
	{
		for (var i = start, il = ingredientVolumes.length; i < il; i++) 
		{
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
	
	return returnObj
}
