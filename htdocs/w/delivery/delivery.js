<!--# include virtual="/js/common/mail.js" -->

;(function(){

function DeliveryWidget (widget)
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

function replayClass (node, cn)
{
  node.classList.remove(cn)
  window.setTimeout(function () { node.classList.add(cn) }, 100)
}

DeliveryWidget.prototype =
{
  livingTargets:
  [
    'в подарок другу', 'подруге в подарок', 'в подарок коллеге',
    'в подарок начальнику', 'для себя', 'прозапас', 'на день рождения', 'под ёлочку'
  ],
  
  // universal commodity/page name fetcher
  getCommodityName: function ()
  {
    // get the first part of a compaund page title
    var first = document.title.split(/\s*—/)[0]
    // try to fetch the commodity name in quotes
    var name = /«(.+)»/.exec(first)
    // return either the matched name or the full first part
    return name ? name[1] : first
  },
  
  bind: function ()
  {
    this.commodityName = this.getCommodityName()
    this.nodes.form.addEventListener('submit', this.sendListener.bind(this), false)
    this.nodes.order.addEventListener('click', this.sendListener.bind(this), false)
    this.nodes.input.addEventListener('keydown', this.saveContact.bind(this).throttle(250, 10000), false)
    this.nodes.repeat.addEventListener('click', this.switchToInit.bind(this), false)
    
    this.init()
  },
  
  init: function ()
  {
    this.loadContact()
    if (this.contact)
    {
      this.nodes.input.value = this.contact
      // track the now user visit
      Statistics.shopUserVisit(this.contact)
    }
    
    if (this.getState() == 'sent')
    {
      this.switchToSent()
    }
  },
  
  bakeMessage: function ()
  {
    var messageBody = [] // accumulate message parts
    
    if (window.UserHistory)
    {
      // add the lst N pages visited
      messageBody.push(UserHistory.report())
    }
    
    var submit = document.createEvent('Event')
    submit.initEvent('inshaker.delivery-widget.submit', true, true)
    submit.deliveryWidgetData = messageBody
    this.nodes.widget.dispatchEvent(submit)
    
    messageBody.push
    (
      this.commodityName + '<br>' +
      window.location.href + '<br><br>' +
      'Телефон: ' + this.contact
    )
    
    // more specific parts go last
    messageBody.reverse()
    // stringify
    messageBody = messageBody.join('<br><br><hr><br><br>')
    
    return {
      subject: 'Заказ: ' + this.commodityName,
      to: 'shop.order@mg.inshaker.ru',
      from: 'Коктейльный магазин <shop.order@mg.inshaker.ru>',
      html: messageBody
    }
  },
  
  sendListener: function (e)
  {
    e.preventDefault()
    
    this.saveContact()
    // the contact field is empty
    if (!this.contact)
    {
      replayClass(this.nodes.input, 'error')
      this.nodes.input.focus()
      return
    }
    this.nodes.input.classList.remove('error')
    
    // track as soon as possible
    Statistics.productOrdered(this.commodityName, this.contact)
    
    Mail.send(this.bakeMessage(), sent.bind(this))
    
    function sent (r)
    {
      if (r.statusType == 'success')
      {
        this.switchToSent()
      }
      else
      {
        Statistics.productOrderError(this.commodityName, this.contact)
        alert('Технические неполадки!\n\nПожалуйста, отправь заказ\nна почту: support@inshaker.ru\nили по телефону: +7 499 391-43-67.\n\nСпасибо!')
      }
    }
  },
  
  switchToSent: function ()
  {
    this.setState('sent')
    this.nodes.widget.setAttribute('data-state', 'sent')
    this.nodes.target.firstChild.nodeValue = this.livingTargets[Math.floor(Math.random() * this.livingTargets.length)]
  },
  
  switchToInit: function ()
  {
    this.setState('init')
    this.nodes.widget.setAttribute('data-state', 'init')
  },
  
  getState: function ()
  {
    return window.localStorage['delivery-widget.state:' + this.commodityName]
  },
  setState: function (state)
  {
    return window.localStorage['delivery-widget.state:' + this.commodityName] = state
  },
  
  loadContact: function ()
  {
    this.contact = window.localStorage['delivery-widget.contact']
  },
  saveContact: function ()
  {
    var value = this.nodes.input.value
    if (!/\S/.test(value)) // has no meaningful symbols
      value = ''
    
    this.contact = window.localStorage['delivery-widget.contact'] = value
  }
}

window.DeliveryWidget = DeliveryWidget

})();

$.onready(function ()
{
  var widget = $('#delivery-widget')
  if (!widget) // not the right page to shop around
    return

  new DeliveryWidget(widget)
})
