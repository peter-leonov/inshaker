var Printer = {
    ID_PLAN_TITLE     : 'plan_title',
    ID_COCKTAILS_NUM  : 'cocktails_num',
    ID_COCKTAILS_LIST : 'cocktails_list',
    ID_INGREDS_LIST   : 'ingredients_list',
    ID_TOOLS_LIST     : 'tools_list',
    ID_RECEIPT        : 'receipt',
    
    ID_COCKTAIL_NAME  : 'cocktail_name',
    ID_COCKTAIL_IMG   : 'cocktail_img',
    ID_INGREDS_IMGS   : 'cocktail_ingreds',

    IMG_MARKER        : '/t/print/li.png',

    ST_BAR_NAME   : 'barName',

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
            if(self.wannaPrint) setTimeout("print()", 500);
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
	   var receiptRoot   = $(this.ID_RECEIPT);
       var ingredsRoot   = $(this.ID_INGREDS_LIST);
       var toolsRoot     = $(this.ID_TOOLS_LIST);
       var imgsRoot      = $(this.ID_INGREDS_IMGS);

       document.title = "Inshaker —  " + cocktail.name;
       $(this.ID_COCKTAIL_NAME).innerHTML = cocktail.name;
       $(this.ID_COCKTAIL_IMG).src = cocktail.getBigImageSrc()
       for(var i = 0; i < cocktail.receipt.length; i++){
            receiptRoot.appendChild(this.createReceiptElement(cocktail.receipt[i]));
       }

	   var ingredients = cocktail.ingredients.sort(Ingredient.sortByGroups);
       for(var i = 0; i < ingredients.length; i++){
           var last = (i == (ingredients.length - 1));
           ingredsRoot.appendChild(this.createIngredPairElement(ingredients[i], last));
       }

       for(var i = 0; i < cocktail.tools.length; i++){
           var last = (i == (cocktail.tools.length - 1));
           toolsRoot.appendChild(this.createToolElement(cocktail.tools[i], last));
       }

       var imgCounter = 0;
       for(var i = 0; i < cocktail.ingredients.length; i++) {
            var img = this.createIngredImage(cocktail.ingredients[i][0]);
            imgsRoot.appendChild(img);
            img.onload = function(e){
                imgCounter++;
                if(imgCounter == cocktail.ingredients.length) print();
            }
       }
	},

    cartInit: function(){
        if(clientStorage.get(GoodHelper.CART)){
            var barName = clientStorage.get(this.ST_BAR_NAME);
            $(this.ID_PLAN_TITLE).innerHTML = "План покупок " + (barName ? "для " + barName : ""); 
            this.preloadImages();
            this.cartData = clientStorage.get(GoodHelper.CART);
            this.cartData = GoodHelper.deSerializeCartData(JSON.parse(this.cartData));
            this.renderCartData(this.cartData);
            this.wannaPrint = true;
        } else {
            alert("ERROR: Unable to obtain cartData");
        }
    },

    renderCartData: function(cartData){
        var cocktailsRoot = $(this.ID_COCKTAILS_LIST);
        var ingredsRoot   = $(this.ID_INGREDS_LIST);
        var toolsRoot     = $(this.ID_TOOLS_LIST); 

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
        $(this.ID_COCKTAILS_NUM).innerHTML = numTxt;
         
        var l = lengthOf(cartData.goods);
		
		var names = [];
		for(var name in cartData.goods) {names.push(name)};
    names = names.sort(Ingredient.sortByGroups);
		
        for(var i = 0; i < names.length; i++){
			var name = names[i];
			var bottles = cartData.goods[name].bottles;
			var j = 0;
            for(id in bottles){
                var last = (i == (l-1)) && (j == (lengthOf(bottles)-1)); 
				ingredsRoot.appendChild(this.createIngredElement(bottles[id], name, last));
                j++;
			}
		}

        var tools = this.collectTools(cartData.cocktails);
        for(var i = 0; i < tools.length; i++) {
            toolsRoot.appendChild(this.createToolElement(tools[i], i == (tools.length-1)));
        }
    },

    collectTools: function(cocktailsAndQuants) {
        var res = [];
        for(var i = 0; i < cocktailsAndQuants.length; i++){
            var cocktail = cocktailsAndQuants[i][0];
            res = res.concat(cocktail.tools);
        }
        return res.uniq();
    },

    createCocktailElement: function(cocktail, quantity, last){
       var dd = document.createElement("dd");
       if(last) dd.className = "last";
       var div = document.createElement("div");
       div.className = "txt";
       var cnt = document.createElement("div");
       cnt.className = "cnt";
       div.innerHTML = cocktail.name;
       cnt.innerHTML = quantity + " " + GoodHelper.pluralTxt(quantity, "порция");
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

    createIngredPairElement: function(pair, last){
        var dd = document.createElement("dd");
        if(last) dd.className = "last";
        var div = document.createElement("div");
        div.className = "txt";
        var img = new Image();
        img.src = this.IMG_MARKER;
        div.appendChild(img);
        var name = pair[0];

        var txt = GoodHelper.getIngredText(name);
        div.appendChild(document.createTextNode(txt));
        
        var cnt = document.createElement("div");
        cnt.innerHTML = GoodHelper.normalVolumeTxtParsed(pair[1]);
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
        
		var txt = GoodHelper.getIngredText(name);
        div.appendChild(document.createTextNode(txt));
        
		var ingred = Ingredient.getByName(name)
		if(GoodHelper.isBottled(Ingredient.getByName(name))){
            var span = document.createElement("span");
            var spanTxt = "(" + GoodHelper.bottleTxt(name, ingred.unit, bottle.vol[0]);
            spanTxt += GoodHelper.normalVolumeTxt(bottle.vol[0], ingred.unit);
            spanTxt += ")";
            span.className = "bottle";
            span.innerHTML = spanTxt;
            div.appendChild(span);
        }

        var cnt = document.createElement("div");
        cnt.innerHTML = bottle.count + " " + GoodHelper.pluralTxt(bottle.count, "штуки");
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
