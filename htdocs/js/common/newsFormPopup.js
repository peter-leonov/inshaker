/**
 * Popup-окошко для подписки на новости о событиях в городе пользователя
 *
 * @requires "/inc/news-form-popup.html"
 * @requires "/t/news-form-popup.css" 
 * @requires "/js/common/autocompleter.js"
 *
 * @param opener - элемент, при клике на котором открывается Popup
 */
function NewsFormPopup (opener) 
{
  var nodes =
  {
      form: cssQuery('#form-popup form')[0],
			formPopup: $('form-popup'),
			formPopupOverlay: cssQuery('#form-popup #overlay')[0],
			formPopupFields: cssQuery('#form-popup .fields')[0],
			formPopupThanks: cssQuery('#form-popup .thanks')[0],
			formPopupMenu: cssQuery('#form-popup .menu')[0],
			formPopupSubmit: cssQuery('#form-popup input[type=submit]')[0],
			formCity: cssQuery('#form-popup input[name=city]')[0],
      opener: opener
  }

  var cities = <!--# include file="/db/cities_list.js"-->

  var View = function (nodes, cities) 
  {
    this.initialize = function ()
    {
      var self = this, formPopupHide = function() { self.hideFormPopup() }, formPopupShow = function() { self.showFormPopup() }
	    nodes.formPopupOverlay.addEventListener('click', formPopupHide, false)
		  nodes.formPopupMenu.addEventListener('click', formPopupHide, false)
      nodes.opener.addEventListener('click', formPopupShow, false)
        
      var form = nodes.form, controller = this.controller
		  form.oncheck = function (e) { return controller.formOnCheck(e.hash) }
		  form.onsuccess = function (e) { return controller.formSuccess(e.hash) }
		  form.onsend = function (e) { return controller.formSend() }
		  form.onload = function (e) { return controller.formLoad() }
		  form.onerror = function (e) { return controller.formError(e.request.errorMessage()) }
    }

    this.startFormChecker = function ()
	  {
		  var self = this
		  clearInterval(this.formCheckTimer)
		  this.formCheckTimer = setInterval(function () { self.controller.formTimeCheck(nodes.form.toHash()) }, 200)
	  }
	
	  this.stopFormChecker = function ()
	  {
		  clearInterval(this.formCheckTimer)
	  }

    this.initAutoCompleter = function ()
    {
        var ac = this.ac = new Autocompleter(cities, nodes.formCity, nodes.form)	
        this.ac.changeListener = { onSearchConfirmed: function (value) {} }
        nodes.formCity.addEventListener('keypress', function(e){ if(e.keyCode == ac.KEY_ENTER) e.preventDefault() }, false)
    }

    this.showFormPopup = function ()
    {
      nodes.formPopupThanks.hide()
      nodes.formPopupFields.show()
      nodes.form.reset()
      nodes.formPopup.show()
      if (!this.ac) this.initAutoCompleter()
      this.startFormChecker()
    }

    this.hideFormPopup = function ()
    {
      this.stopFormChecker()
      nodes.formPopup.hide()
    }
  
    this.setFormLock = function (status)
	  {
		  var button = nodes.formPopupSubmit
		  status ? button.disable() : button.enable()
	  }
	
	  this.resetForm = function ()
	  {
		  nodes.form.reset()
		  this.setFormLock(true)
	  }
	
    this.showFormPopupThanks = function ()
	  {
		  this.stopFormChecker()
		  nodes.formPopupFields.hide()
		  nodes.formPopupThanks.show()
	  }

  }

  var Controller = function (model, view)
  {
    this.checkTheForm = function (hash)
	  {
		  fields = ['first', 'city', 'email']
		
		  for (var i = 0; i < fields.length; i++)
			  if (!hash[fields[i]])
				  return false
		
		  if (!/\w+\@\w+\.\w+/.test(hash['email']))
			  return false
		
		  return true
	  }
	
	  this.formOnCheck = function (hash)
	  {
		  return this.checkTheForm(hash, fields)
	  }
	
	  this.formTimeCheck = function (hash)
	  {
		  view.setFormLock(!this.checkTheForm(hash))
	  }
	
	  this.formSend = function ()
	  {
		  view.stopFormChecker()
		  view.setFormLock(true)
	  }
	
	  this.formLoad = function ()
	  {
		  view.setFormLock(false)
	  }
	
	  this.formSuccess = function (hash)
  	{
      view.showFormPopupThanks()
		  view.resetForm()
      setTimeout(function () { view.hideFormPopup() }, 1200)
	  }
    
    view.controller = this
    view.initialize()
  }

  var Model = function (view) { }

  this.view = new View(nodes, cities)
  this.model = new Model(this.view)
  this.controller = new Controller(this.model, this.view) 

}
