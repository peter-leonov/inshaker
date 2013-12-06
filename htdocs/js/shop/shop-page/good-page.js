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
    input: $('.delivery-widget-input', widget),
    order: $('.delivery-widget-order', widget),
    target: $('.delivery-widget-repeat .target', widget),
    repeat: $('.delivery-widget-repeat', widget)
  }
  
  this.bind()
}

OrderForm.prototype =
{
  livingTargets:
    [
      'в подарок другу', 'подруге в подарок', 'в подарок коллеге',
      'в подарок начальнику', 'для себя', 'прозапас', 'на день рождения', 'под ёлочку'
    ],
  
  bind: function ()
  {
    this.productName = this.nodes.form.getAttribute('data-item-title')
    this.nodes.form.addEventListener('submit', this.sendListener.bind(this), false)
    this.nodes.order.addEventListener('click', this.sendListener.bind(this), false)
    this.nodes.input.addEventListener('keydown', this.saveContact.bind(this).throttle(250, 10000), false)
    this.nodes.repeat.addEventListener('click', this.switchToInit.bind(this), false)
    
    this.loadContact()
    if (this.contact)
    {
      this.nodes.input.value = this.contact
      // track the now user visit
      Statistics.shopUserVisit(this.contact)
    }
    
    if (window.localStorage['delivery-widget.state'] == 'sent')
    {
      this.switchToSent()
    }
  },
  
  sendListener: function (e)
  {
    e.preventDefault()
    
    // track as soon as possible
    Statistics.productOrdered(this.productName, this.contact)
    
    this.saveContact()
    // the contact field is empty
    if (!this.contact)
      return
    
    var message =
    {
      subject: 'Заказ: ' + this.productName,
      to: 'shop.order@mg.inshaker.ru',
      from: 'Product Page <shop.order@mg.inshaker.ru>',
      text: this.productName + '\n'+ window.location.href + '\n\n' +
            'Контакт: ' + this.contact
    }
    
    Mail.send(message, sent.bind(this))
    
    function sent (r)
    {
      if (r.statusType == 'success')
      {
        this.switchToSent()
      }
      else
      {
        Statistics.productOrderError(this.productName, this.contact)
        alert('Технические неполадки!\n\nПожалуйста, отправь заказ\nна почту: support@inshaker.ru\nили по телефону: +7 499 391-43-67.\n\nСпасибо!')
      }
    }
  },
  
  switchToSent: function ()
  {
    window.localStorage['delivery-widget.state'] = 'sent'
    this.nodes.widget.setAttribute('data-state', 'sent')
    this.nodes.target.firstChild.nodeValue = this.livingTargets[Math.floor(Math.random() * this.livingTargets.length)]
  },
  
  switchToInit: function ()
  {
    window.localStorage['delivery-widget.state'] = 'init'
    this.nodes.widget.setAttribute('data-state', 'init')
  },
  
  loadContact: function ()
  {
    this.contact = window.localStorage['delivery-widget.contact']
  },
  saveContact: function ()
  {
    var value = this.nodes.input.value
    if (!/\S/.test(value)) // has no meaningful symbols
      value = undefined
    
    this.contact = window.localStorage['delivery-widget.contact'] = value
  }
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
