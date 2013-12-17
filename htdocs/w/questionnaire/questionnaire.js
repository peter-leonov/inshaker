<!--# include virtual="/liby/modules/date.js"-->
<!--# include virtual="/liby/modules/form-helper.js"-->

;(function(){

function QuestionnairePopup () {}

QuestionnairePopup.prototype =
{
  bind: function (nodes)
  {
    this.nodes = nodes
    
    this.name = nodes.name.getAttribute('data-poll-name')
  },
  
  show: function ()
  {
    var me = this
    
    this.nodes.form.addEventListener('submit', function (e) { me.onsubmit(e) }, false)
    this.nodes.form.addEventListener('change', function (e) { me.onchange(e) }, false)
    this.nodes.form.addEventListener('click', function (e) { me.onchange(e) }, false)
    
    var popup = this.popup = new Popup()
    popup.bind(this.nodes.popup)
    popup.addEventListener('hide', function (e) { me.hide() }, false)
    popup.addEventListener('ui-hide', function (e) { me.hideFromUI() }, false)
    this.popup.show()
  },
  
  hide: function ()
  {
    Cookie.set(this.name + '-hidden', Date.now(), Date.add('28d'), '/')
  },
  
  hideFromUI: function ()
  {
    this.poll('hide')
    this.hide()
  },
  
  maybeShow: function ()
  {
    var hidden = Cookie.get(this.name + '-hidden')
    if (hidden)
      return
    
    if (Math.floor(Math.random() * 3) != 0)
    {
      this.hide()
      return
    }
    
    this.show()
  },
  
  onchange: function ()
  {
    this.nodes.button.disabled = false
  },
  
  onsubmit: function (e)
  {
    e.preventDefault()
    
    var answer = FormHelper.toHash(e.target).answer
    this.poll(answer)
    
    this.nodes.root.classList.add('done')
    
    var popup = this.popup
    window.setTimeout(function () { popup.hide() }, 1000)
  },
  
  poll: function (value)
  {
    Statistics.poll(this.name, value)
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
  
  var widget = new QuestionnairePopup()
  widget.bind(nodes)
  
  widget.maybeShow()
}

$.onready(onready)

})();
