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
    Statistics.productOrdered(this.productName, this.contact)
    
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
