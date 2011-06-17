;(function(){

var myName = 'MybarButton',
	Me = self[myName] = MVC.create(myName)

var myProto =
{
	bind: function (nodes)
	{
		this.view.bind(nodes)
	},
	
	setState : function(ingredient)
	{
		this.model.setState(ingredient)
	}
}

Object.extend(Me.prototype, myProto)

})();


/*View*/

;(function(){

var Me = MybarButton.View

var myProto =
{
	bind : function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		this.nodes.button.addEventListener('click', function(e){ me.myBarButtonClick(e) }, false)
	},

	renderMybarButton : function(inBar)
	{
		var b = this.nodes.button
		
		if(inBar)
		{
			b.addClassName('have')
		}
		else
		{
			b.addClassName('no-have')
		}
		b.show()
	},
	
	myBarButtonClick : function(e)
	{
		var b = this.nodes.button
		
		if(b.hasClassName('no-have'))
		{
			this.controller.addIngredient()
		}
		else
		{
			this.controller.removeIngredient()
		}
	},
	
	addIngredient : function()
	{
		log(1)
		this.nodes.button.addClassName('have')
		this.nodes.button.removeClassName('no-have')
	},
	
	removeIngredient : function()
	{
		this.nodes.button.addClassName('no-have')
		this.nodes.button.removeClassName('have')		
	}
}

Object.extend(Me.prototype, myProto)

})();


/*Model*/

;(function(){

var Me = MybarButton.Model

var myProto =
{
	setState : function(ingredient)
	{
		this.ingredient = ingredient
		
		var me = this
		BarStorage.initBar(function(){
			me.inBar = BarStorage.haveIngredient(ingredient.name)
			me.view.renderMybarButton(me.inBar)
		})
	},
	
	addIngredient : function()
	{
		BarStorage.addIngredient(this.ingredient.name)
		this.view.addIngredient()
	},
	
	removeIngredient : function()
	{
		BarStorage.removeIngredient(this.ingredient.name)
		this.view.removeIngredient()
	}
}

Object.extend(Me.prototype, myProto)

})();


/*Controller*/

;(function(){

var Me = MybarButton.Controller

var myProto =
{
	addIngredient : function()
	{
		this.model.addIngredient()
	},
	
	removeIngredient : function()
	{
		this.model.removeIngredient()
	}
}

Object.extend(Me.prototype, myProto)

})();
