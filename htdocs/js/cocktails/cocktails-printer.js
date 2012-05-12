function uniqBy (ary, f)
{
	var res = []
	
	var seen = {}
	for (var i = 0, il = ary.length; i < il; i++)
	{
		var v = ary[i]
		
		var key = f(ary[i])
		if (seen[key])
			continue
		seen[key] = true
		
		res.push(v)
	}
	
	return res
}

var Printer = {
    IMG_MARKER        : '/t/print/li.png',

    wannaPrint: false,
    cartData : {},

	initCart: function (param)
	{
		var me = this
		clientStorage.ready(function () { me.cartInit(param) })
	},
	
	initCocktail: function (param)
	{
		var me = this
		clientStorage.ready(function () { me.cocktailInit(param) })
	},


    preloadImages: function(){
        var img = new Image();
        var self = this;
        img.src = this.IMG_MARKER;
        img.onload = function(e){
            if (self.wannaPrint)
                setTimeout(function () { window.print() }, 1000)
        }
    },

    cocktailInit: function(name){
        this.preloadImages();
		var cocktail = Cocktail.getByName(name)
		this.loadData(cocktail)
  		this.renderCocktail(cocktail);
    },  
	
	// dirty synchronous json loading
	loadData: function (cocktail)
	{
		var data = eval('(' + Request.get(cocktail.getPath() + 'data.json', null, null, true).responseText + ')')
		Object.extend(cocktail, data)
	},
	
	
	renderCocktail: function(cocktail){
	   var receiptRoot   = $('#receipt');
       var ingredsRoot   = $('#ingredients_list');
       var toolsRoot     = $('#tools_list');
       var imgsRoot      = $('#cocktail_ingreds');

       document.title = "Inshaker —  " + cocktail.name;
       $('#cocktail_name').innerHTML = cocktail.name;
       $('#cocktail_img').src = cocktail.getBigImageSrc()
       for(var i = 0; i < cocktail.receipt.length; i++){
            receiptRoot.appendChild(this.createReceiptElement(cocktail.receipt[i]));
       }

	   var ingredients = cocktail.ingredients
       for(var i = 0; i < ingredients.length; i++){
           var last = (i == (ingredients.length - 1));
           ingredsRoot.appendChild(this.createIngredPairElement(ingredients[i], last));
       }

       for(var i = 0; i < cocktail.tools.length; i++){
           var last = (i == (cocktail.tools.length - 1));
           toolsRoot.appendChild(this.createToolElement(cocktail.tools[i][0], last));
       }

       var imgCounter = 0;
       for(var i = 0; i < cocktail.ingredients.length; i++) {
            var img = this.createIngredImage(cocktail.ingredients[i][0]);
            imgsRoot.appendChild(img);
            img.onload = function(e){
                imgCounter++;
                if(imgCounter == cocktail.ingredients.length)
                    setTimeout(function () { window.print() }, 1000)
            }
       }
	},

    cartInit: function(){
        if(clientStorage.get(Calculator.CART)){
            this.preloadImages();
            this.cartData = clientStorage.get(Calculator.CART);
            this.cartData = Calculator.deSerializeCartData(JSON.parse(this.cartData));
            this.renderCartData(this.cartData);
            this.wannaPrint = true;
        } else {
            alert("ERROR: Unable to obtain cartData");
        }
    },

    renderCartData: function(cartData){
        var cocktailsRoot = $('#cocktails_list');
        var ingredsRoot   = $('#ingredients_list');
        var toolsRoot     = $('#tools_list'); 

        var cNum = 0;
        for(var i = 0; i < cartData.cocktails.length; i++){
            var cocktail = cartData.cocktails[i][0];
            var quantity = cartData.cocktails[i][1];
            cNum += quantity;
            
            var last = (i == (cartData.cocktails.length-1));
            cocktailsRoot.appendChild(this.createCocktailElement(cocktail, quantity, last));
        }
        var numTxt = "";
        if(cNum > 1) numTxt = cNum + " " + cNum.plural("коктейль", "коктейля", "коктейлей");
        $('#cocktails_num').innerHTML = numTxt;
         
        var l = Object.keysCount(cartData.goods);
		
		var ingredients = []
		for (var name in cartData.goods)
			ingredients.push(Ingredient.getByName(name))
		ingredients.sort(Ingredient.compareByName)
		
		for(var i = 0; i < ingredients.length; i++)
		{
			var ingredient = ingredients[i]
			var bottles = cartData.goods[ingredient.name].bottles;
			var j = 0;
            for(id in bottles){
                var last = (i == (l-1)) && (j == (Object.keysCount(bottles)-1));
				ingredsRoot.appendChild(this.createIngredElement(bottles[id], ingredient.name, last));
                j++;
			}
		}

        var tools = this.collectTools(cartData.cocktails);
        for(var i = 0; i < tools.length; i++) {
            toolsRoot.appendChild(this.createToolElement(tools[i][0], i == (tools.length-1)));
        }
    },

    collectTools: function(cocktailsAndQuants) {
        var res = [];
        for(var i = 0; i < cocktailsAndQuants.length; i++){
            var cocktail = cocktailsAndQuants[i][0];
            res = res.concat(cocktail.tools);
        }
        return uniqBy(res, function (v) { return v[0] })
    },

    createCocktailElement: function(cocktail, quantity, last){
       var dd = document.createElement("dd");
       if(last) dd.className = "last";
       var div = document.createElement("div");
       div.className = "txt";
       var cnt = document.createElement("div");
       cnt.className = "cnt";
       div.innerHTML = cocktail.name;
       
       var plurals = (cocktail.cart && cocktail.cart.plural) || ['порция', 'порции', 'порций']
       
       cnt.innerHTML = quantity + " " + quantity.plural.apply(quantity, plurals)
       dd.appendChild(div);
       dd.appendChild(cnt);
       return dd;
    },

    createReceiptElement: function(line) {
        var li = document.createElement("li");
        li.innerHTML = line;
        return li; 
    },
    
    createIngredImage: function(name){
       var img = document.createElement('img')
       img.src = Ingredient.getByName(name).getMiniImageSrc()
       return img;
    },
	
	getIngredientBrandedName: function(name){
		var brand = Ingredient.getByName(name).brand || "";
		if(brand.indexOf(name) > -1) name = "";
		var gap = "";
		if(brand && name) gap = " ";
		return name + (brand ? gap + brand : "");
	},
	
    createIngredPairElement: function(pair, last){
        var dd = document.createElement("dd");
        if(last) dd.className = "last";
        var div = document.createElement("div");
        div.className = "txt";
        var img = new Image();
        img.src = this.IMG_MARKER;
        div.appendChild(img);
        var name = pair[0];
		var ingredient = Ingredient.getByName(name)
        var txt = this.getIngredientBrandedName(name);
        div.appendChild(document.createTextNode(txt));
        
        var cnt = document.createElement("div");
        var h = Units.humanizeDose(pair[1], ingredient.unit)
        cnt.innerHTML = h[0] + ' ' + h[1]
        cnt.className = "cnt";

        dd.appendChild(div);
        dd.appendChild(cnt);
        return dd;
    },
    
    createIngredElement: function(bottle, name, last) {
        var dd = document.createElement("dd");
        if(last) dd.className = "last";
        
        var div = document.createElement("div");
        div.className = "txt";
        var img = new Image();
        img.src = this.IMG_MARKER;
        div.appendChild(img);
        
		var txt = this.getIngredientBrandedName(name);
        div.appendChild(document.createTextNode(txt));
        
		var ingred = Ingredient.getByName(name)
        var span = document.createElement("span");
        span.className = "bottle";
        var h = Units.humanizeDose(bottle.vol[0], ingred.unit)
        span.appendChild(document.createTextNode(h[0] + ' ' + h[1]))
        div.appendChild(span);

        var cnt = document.createElement("div");
        cnt.innerHTML = bottle.count + " " + bottle.count.plural("штука", "штуки", "штук")
        cnt.className  = "cnt";
       
        dd.appendChild(div);
        dd.appendChild(cnt);
        return dd;
    },

    createToolElement: function(name, last) {
        var dd = document.createElement("dd");
        if(last) dd.className = "last";
        var div = document.createElement("div");
        var img = new Image();
        img.src = this.IMG_MARKER;
        div.appendChild(img);
        div.appendChild(document.createTextNode(name));
        div.className = "txt";

        dd.appendChild(div);
        return dd;
    }

};
