var findCheapestPrice = function(ingredient, v)
{		
	var ingredientVolumes = ingredient.volumes
	ingredientVolumes.map(function(a){ a.nominalPrice = a[1]/a[0] })
	ingredientVolumes.sort(function(a, b){ return a.nominalPrice - b.nominalPrice })
	
	var minNominal = ingredientVolumes[0].nominalPrice
	
	console.log(ingredientVolumes)
	
	var bottleVolume = ingredientVolumes[0][0]
	var bottles = Math.ceil(v / bottleVolume)
	var pricePerBottle = ingredientVolumes[0][1]
	var volume = bottles * bottleVolume
	var totalPrice = bottles * pricePerBottle
	var minPrice = totalPrice
	var returnObj = { bottles : [], price : minPrice, addingBottles : { amount : bottles, vol : bottleVolume, pricePerBottle : pricePerBottle } }
	
	var f = true
	
	console.log(returnObj)
	
	ingredientVolumes.sort(function(a, b){ return b.nominalPrice - a.nominalPrice })
	
	appendBottles(volume, minPrice, 0, [], bottles)
	
	function appendBottles(currentVolume, currentPrice, start, bottles, addingBottles)
	{
		for (var i = start, il = ingredientVolumes.length; i < il; i++) 
		{
			var volumeObj = ingredientVolumes[i]
			var vol = currentVolume
			var tbottles = addingBottles
			var temporyPrice = currentPrice
			
			console.log('i', i)
			
			while(tbottles > 0 && v - vol <= volumeObj[0] && i != il - 1 )
			{
				vol -= bottleVolume
				tbottles--
				temporyPrice -= pricePerBottle
				
			}
			f = false
			console.log('tbottles', tbottles)
			console.log('-----------------------------')
			
			var tprice = temporyPrice + volumeObj[1]
			
			console.log(bottles)
			
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

var ingredient = { volumes : [[0.5, 37.90], [1.0, 52.90], [2.0, 56.90]]
 }

var res = findCheapestPrice(ingredient, 2.5)

// console.log(res)
