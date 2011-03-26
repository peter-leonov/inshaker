var findCheapestPrice = function(v, ingredientVolumes)
{		
	ingredientVolumes.map(function(a){ a.push(a[1]/a[0]) })
	ingredientVolumes.sort(function(a, b){ return a[2] - b[2] })
	
	var bottleVolume = ingredientVolumes[0][0]
	var bottles = Math.ceil(v / bottleVolume)
	var pricePerBottle = ingredientVolumes[0][1]
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
			
			while(i !=  0 && tbottles > 0 && v - vol < volumeObj[0])
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

var arr = [[3, 4], [2, 3], [1, 2]]

var res = findCheapestPrice(13, arr)

console.log(res)
