<!--# include virtual="/liby/modules/google-api-loader.js" -->

<!--# include virtual="/liby/widgets/map.js" -->
<!--# include virtual="/liby/widgets/map-light-marker.js" -->

<!--# include virtual="/js/common/google.js" -->

<!--# include virtual="shop-point.js" -->

<!--# include virtual="/liby/modules/motion.js" -->
<!--# include virtual="/liby/modules/motion-types.js" -->
<!--# include virtual="/liby/modules/animation.js" -->
<!--# include virtual="/js/common/rolling-images.js" -->

<!--# include virtual="/liby/modules/form-helper.js" -->
<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/function-throttle.js" -->
<!--# include virtual="/js/common/mail.js" -->

$.onready(function ()
{
	UserAgent.setupDocumentElementClassNames()
	
	var nodes =
	{
		promo: $('#promo'),
		
		address: $('#promo .info .location p'),
		phone: $('#promo .info .phone p'),
		
		map: $('#map .map'),
		positionControl: $('.position-control'),
		
		cocktails: $('#cocktails .list'),
		
		photos: $('.photos')
	}
	
	var widget = new GoodPage(nodes)
	widget.render()
})

;(function(){

eval(NodesShortcut.include())

function GoodPage (nodes)
{
	this.nodes = nodes
}

GoodPage.prototype =
{
	render: function ()
	{
		this.initMap()
		this.initCocktails()
		this.bindScroller()
	},
	
	initMap: function ()
	{
		if (this.map)
			return
		
		var map = this.map = new Map()
		map.bind({main: this.nodes.map, control: this.nodes.positionControl})
		map.setCenter({lat: 55.783016, lng: 37.599892}, 14)
		
		var shop =
		{
			name: 'Коктейльный магазин',
			contacts:
			{
				address: this.nodes.address.firstChild.nodeValue,
				tel: this.nodes.phone.firstChild.nodeValue
			},
			point: [55.783016, 37.599892]
		}
		map.setPoints([new ShopPoint(shop)])
	},
	
	initCocktails: function ()
	{
		var cocktails = InPageCahchedData.cocktails,
			fragment = document.createDocumentFragment()
		
		for (var i = 0, il = cocktails.length; i < il; i++)
		{
			var cocktail = this.renderCocktail(cocktails[i])
			fragment.appendChild(cocktail)
		}
		
		this.nodes.cocktails.appendChild(fragment)
	},
	
	renderCocktail: function (cocktail)
	{
		var li = N('li')
		
		var a = N('a')
		a.href = cocktail.legacyUri
		li.appendChild(a)
		
		var image = Nc('div', 'image')
		a.appendChild(image)
		
		var img = N('img')
		img.src = cocktail.imageUrl
		image.appendChild(img)
		
		var name = Nct('div', 'name', cocktail.name)
		a.appendChild(name)
		
		return li
	},
	
	bindScroller: function ()
	{
		new RollingImagesLite(this.nodes.photos, {animationType: 'easeOutCubic', duration: 0.7})
	}
}

window.GoodPage = GoodPage

})();


;(function(){

function OrderForm (widget)
{
  this.nodes =
  {
    widget: widget,
    form: $('.delivery-widget-form', widget),
    input: $('.delivery-widget-input', widget)
  }
  
  this.bind()
}

OrderForm.prototype =
{
  bind: function ()
  {
    this.productName = this.nodes.form.getAttribute('data-item-title')
    this.nodes.form.addEventListener('submit', this.sendListener.bind(this), false)
    this.nodes.input.addEventListener('keydown', this.saveContact.bind(this).throttle(250, 10000), false)
    
    var contact = window.localStorage['delivery-widget.contact']
    if (contact != null)
      this.nodes.input.value = contact
  },
  
  sendListener: function (e)
  {
    e.preventDefault()
    
    var h = FormHelper.toHash(e.target)
    
    // empty contact field
    if (!/\S/.test(h.contact))
      return
    
    var message =
    {
      subject: 'Заказ: ' + this.productName,
      to: 'shop.order@mg.inshaker.ru',
      from: 'Product Page <shop.order@mg.inshaker.ru>',
      text: this.productName + '\n'+ window.location.href + '\n\n' +
            'Контакт: ' + h.contact
    }
    
    Mail.send(message, sent.bind(this))
    
    function sent (r)
    {
      if (r.statusType == 'success')
      {
        this.formSuccess()
      }
      else
      {
        alert('Технические неполадки!\n\nПожалуйста, отправь заказ\nна почту: support@inshaker.ru\nили по телефону: +7 499 391-43-67.\n\nСпасибо!')
      }
    }
  },
  
  formSuccess: function ()
  {
    log('ok')
  },
  
  saveContact: function ()
  {
    console.log(this.nodes.input.value)
    window.localStorage['delivery-widget.contact'] = this.nodes.input.value
  },
}

window.OrderForm = OrderForm

})();

$.onready(function ()
{
  var widget = $('#delivery-widget')
  if (!widget) // not the right page to shop around
    return

  new OrderForm(widget)
})
