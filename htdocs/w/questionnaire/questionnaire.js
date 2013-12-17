<!--# include virtual="/liby/modules/date.js"-->
<!--# include virtual="/liby/modules/form-helper.js"-->

;(function(){

function QuestionnairePopup (nodes)
{
  this.nodes = nodes
  this.name = nodes.name.getAttribute('data-form-name')
  this.title = nodes.name.firstChild.nodeValue
}

QuestionnairePopup.prototype =
{
  show: function ()
  {
    var me = this
    
    this.nodes.form.addEventListener('submit', function (e) { me.onsubmit(e) }, false)
    
    // use label text as input names
    var elements = this.nodes.form.elements
    for (var i = 0, il = elements.length; i < il; i++)
      elements[i].name = elements[i].parentNode.firstChild.nodeValue
    
    var popup = this.popup = new Popup()
    popup.bind(this.nodes.popup)
    popup.addEventListener('hide', function (e) { me.hide() }, false)
    popup.addEventListener('ui-hide', function (e) { me.hideFromUI() }, false)
    this.popup.show()
    
    // catch the adjusting scroll after load
    function onscroll ()
    {
      popup.adjustPostion()
      window.removeEventListener('scroll', onscroll, false)
    }
    window.addEventListener('scroll', onscroll, false)
    window.setTimeout(function () { window.removeEventListener('scroll', onscroll, false) }, 1000)
  },
  
  hide: function ()
  {
    window.localStorage.setItem('questionnaire.' + this.name + '.hidden', +new Date())
  },
  
  hideFromUI: function ()
  {
    Statistics.questionnaire(this.name, 'cancel')
    this.hide()
  },
  
  maybeShow: function ()
  {
    var hidden = window.localStorage.getItem('questionnaire.' + this.name + '.hidden')
    if (hidden && new Date() < new Date(+hidden).add('3s')) // 28d
      return
    
    if (Math.floor(Math.random() * 3) != 0)
    {
      this.hide()
      return
    }
    
    this.show()
  },
  
  onsubmit: function (e)
  {
    e.preventDefault()
    
    var form = FormHelper.toHash(e.target)
    
    var messageBody = '<table cellspacing="5">'
    for (var k in form)
      messageBody += '<tr><td>' + k + '</td><td>' + form[k] + '</td></tr>'
    messageBody += '</table>'
    
    Mail.send({
      subject: 'Форма: ' + this.title,
      to: 'pl@inshaker.ru',
      from: 'Коктейльный сайт <mail@inshaker.ru>',
      html: messageBody
    }, function noop () {})
    
    this.nodes.root.classList.add('done')
    
    var popup = this.popup
    window.setTimeout(function () { popup.hide() }, 1000)
  }
}

window.QuestionnairePopup = QuestionnairePopup

})();


;(function(){

function onready ()
{
  var nodes =
  {
    root: $('#questionnaire-popup .poll-window'),
    form: $('#questionnaire-popup .poll-form'),
    name: $('#questionnaire-popup .poll-form .poll-name'),
    button: $('#questionnaire-popup .poll-form button'),
    popup:
    {
      root: $('#questionnaire-popup'),
      window: $('#questionnaire-popup .popup-window'),
      front: $('#questionnaire-popup .popup-front')
    }
  }
  
  var widget = new QuestionnairePopup(nodes)
  widget.maybeShow()
}

$.onready(onready)

})();
