{(function(){

var doc = document
function N (name) { return doc.createElement(name) }
function T (text) { return doc.createTextNode(text) }

EventPage.view =
{
	owner: null, // must be defined before initialize
	
	initialize: function (nodes)
	{
		this.nodes = nodes
		var me = this,
			controller = this.owner.controller
		
		function formPopupCloseClicked () { controller.formPopupCloseClicked() }
		nodes.formPopupOverlay.addEventListener('click', formPopupCloseClicked, false)
		nodes.formPopupMenu.addEventListener('click', formPopupCloseClicked, false)
		
		function formPopupOpenClicked () { controller.formPopupOpenClicked() }
		nodes.getInvitation.forEach(function (v) { v.addEventListener('click', formPopupOpenClicked, false) })
		
		nodes.ratingShowAll.addEventListener('click', function () { controller.ratingShowAllClicked() }, false)
		
		var form = nodes.form
		form.oncheck = function (e) { return controller.formOnCheck(e.hash, e.form.variableFields) }
		form.onsuccess = function (e) { return controller.formSuccess(e.hash) }
		form.onsend = function (e) { return controller.formSend() }
		form.onload = function (e) { return controller.formLoad() }
		form.onerror = function (e) { return controller.formError(e.request.errorMessage()) }
		
		
		nodes.ratingShowAll.hide = nodes.formPopupFields.hide = nodes.formPopupThanks.hide = function () { this.style.visibility = 'hidden' }
		nodes.ratingShowAll.show = nodes.formPopupFields.show = nodes.formPopupThanks.show = function () { this.style.visibility = 'visible' }
	},
	
	start: function ()
	{
		var name = this.nodes.name.innerHTML
		this.owner.controller.setEventName(name)
	},
	
	modelChanged: function (event)
	{
	    this.iroot = '/i/event/' + event.city.trans().htmlName() + '/' + event.href
		this.renderDialogue(event.dialogue)
		this.renderRating(event.rating)
		this.renderRatingHead(event.rating)
		this.renderLowSponsors(event.low)
		this.renderMediumSponsors(event.medium)
		this.renderHighSponsors(event.high)
		this.renderVariableFields(event.fields, event.name)
		this.setFormLock(true)
	},
	
	renderLowSponsors: function (sponsorsSet)
	{
		var root = this.nodes.sponsorsLowContent
		root.empty()
		
		var main = N('dl')
		root.appendChild(main)
		
		var tabs = []
		var buttons = []
		
		var all = []
		for (var i = 0; i < sponsorsSet.length; i++)
		{
			var logos = sponsorsSet[i].logos
			for (var j = 0; j < logos.length; j++)
				all.push(logos[j])
		}
		sponsorsSet.unshift({name: 'Все', logos: all})
		
		for (var i = 0; i < sponsorsSet.length; i++)
		{
			var part = sponsorsSet[i]
			var dt = N('dt')
			var a = N('a')
			a.appendChild(T(part.name.replace(/\s+/g, ' ')))
			dt.appendChild(a)
			
			var dd = N('dd')
			
			var node = this.createLowSponsorNode(part.logos)
			dd.appendChild(node)
			
			main.appendChild(dt)
			main.appendChild(T(' '))
			main.appendChild(dd)
			main.appendChild(T(' '))
			
			buttons.push(dt)
			tabs.push(dd)
			
			new Programica.RollingImagesLite(node, {animationType: 'easeOutQuad'})
			dd.hide = function () { this.style.visibility = 'hidden' }
			dd.show = function () { this.style.visibility = 'visible' }
		}
		
		var spacer = N('dt')
		spacer.className = 'spacer'
		spacer.appendChild(T(' '))
		main.appendChild(spacer)
		
		Switcher.bind(main, buttons, tabs)
		main.select(0)
	},
	
	createLowSponsorNode: function (logosSet)
	{
		var root = N('div')
		root.className = 'programica-rolling-images'
		
		var prev = N('a')
		prev.className = 'prev'
		var next = N('a')
		next.className = 'next'
		
		var viewport = N('div')
		viewport.className = 'viewport'
		
		var surface = N('ul')
		surface.className = 'surface'
		viewport.appendChild(surface)
		
		for (var i = 0; i < logosSet.length; i++)
		{
			var logo = logosSet[i]
			
			if (i % 5 == 0)
			{
				var point = N('li')
				point.className = 'point'
			}
			
			var a = N('a')
			a.href = logo.href
			point.appendChild(a)
			point.appendChild(T(' '))
			
			var img = N('img')
			a.appendChild(img)
			img.src = this.iroot + '/logos/' + logo.src
			
			
			if (i % 5 == 4)
				point.appendChild(N('b')).appendChild(T(' '))
			
			surface.appendChild(point)
		}
		
		root.appendChild(prev)
		root.appendChild(next)
		root.appendChild(viewport)
		
		return root
	},
	
	renderRating: function (rating)
	{
		if (!rating || !rating.data)
			return
		
		var nodes = this.nodes,
			data = rating.data,
			root = nodes.rating,
			sorted = Object.keys(data).sort(function (a, b) { return data[b] - data[a] }),
			max = data[sorted[0]],
			min = data[sorted[sorted.length-1]],
			padding = String(max).length * 7.5,
			k = max && min ? ((171 - padding) / (max - min + 1)  * 100) / 100 : 1
		
		for (var i = 0; i < sorted.length; i++)
		{
			var name = sorted[i],
				count = data[name]
			
			var dt = N('dt')
			dt.appendChild(T(name))
			
			var dd = N('dd')
			var width = String(Math.floor((count - min + 1) * k) + padding)
			dd.animate('easeInOutQuad', {width: [padding, width]}, 1)
			dd.appendChild(T(count))
			
			root.appendChild(dt)
			root.appendChild(dd)
		}
		
		if (sorted.length > rating.max)
		{
			root.style.height = rating.max * 18 + 'px'
			this.nodes.ratingShowAll.show()
		}
	},
	
	showAllRating: function ()
	{
		var root = this.nodes.rating
		root.animate('easeOutQuad', {height:root.scrollHeight}, 0.5)
		this.nodes.ratingShowAll.hide()
	},
	
	renderRatingHead: function (rating)
	{
		var totalPeople = 0, totalFrom = 0, data = rating.data
		
		for (var k in data)
			totalPeople += data[k],
			totalFrom++
		
		var ratingHead = this.nodes.ratingHead
		ratingHead.empty()
		function builder (act)
		{
			var node
			if (act.name)
			{
				node = N('span')
				node.className = act.name
				node.appendChild(T(act.value))
			}
			else
				node = T(act.value)
			
			ratingHead.appendChild(node)
		}
		
		if (rating.phrase)
			this.execPluralizer(rating.phrase, builder, [totalPeople, totalFrom])
	},
	
	execPluralizer: function (ops, fun, data)
	{
		var plural = Number.prototype.plural
			A = Array
		for (var i = 0; i < ops.length; i++)
		{
			var op = ops[i]
			switch (typeof op)
			{
				case 'string':
					fun({value:op})
				break
				
				case 'object':
					if (op[0] !== null && typeof op[2] == 'object' && op[2].constructor == A)
						fun({name:op[1], value:plural.apply(Number(data[op[0]]), op[2])})
					else if (op[0] !== null)
						fun({name:op[1], value:data[op[0]]})
				break
			}
		}
		
	},
	
	renderMediumSponsors: function (sponsorsSet)
	{
		var root = this.nodes.sponsorsMedium
		
		for (var i = 0; i < sponsorsSet.length; i++)
		{
			var sponsor = sponsorsSet[i]
			
			var a = N('a')
			a.className = 'column sponsor'
			a.href = sponsor.href
			
			var img = N('img')
			img.src = this.iroot + '/logos/' + sponsor.src
			img.alt = sponsor.name
			a.appendChild(img)
			
			root.appendChild(a)
		}
	},
	
	renderHighSponsors: function (sponsorsSet)
	{
		var nodes = this.nodes
		
		var sponsor = sponsorsSet[0]
		nodes.sponsorsHighTitle.innerHTML = sponsor.name
		nodes.sponsorsHigh.style.backgroundImage = 'url(' + this.iroot + '/logos/' + sponsor.src + ')'
		nodes.sponsorsHigh.href = sponsor.href
	},
	
	renderDialogue: function (dialogue)
	{
		dialogue = dialogue ? dialogue[Math.floor(dialogue.length * Math.random())] || dialogue[0] : null
			
		var nodes = this.nodes,
			illustration = nodes.illustration,
			illustrationPopups = nodes.illustrationPopups
		
		if (!dialogue)
			return illustration.remove()
		
		illustration.style.backgroundImage = 'url(' + this.iroot + '/dialogues/' + dialogue.back + ')'
		illustrationPopups.src = this.iroot + '/dialogues/' + dialogue.popups
		
		illustrationPopups.animate('linearTween', {opacity: [0]}, 0.01)
		
		function animatePopups ()
		{
			illustrationPopups.animate('linearTween', {opacity: [0]}, 0.3).oncomplete =
			function ()
			{
				setTimeout
				(
					function ()
					{ 
					if (illustration.scrollTop + 300 >= illustration.scrollHeight)
						illustration.scrollTop = 0
					else
						illustration.scrollTop += 300
				
					illustrationPopups.animate('linearTween', {opacity: [1]}, 0.3)
					},
					500
				)
			}
		}
		
		setInterval(animatePopups, 3200)
	},
	
	renderVariableFields: function (fieldsSet, name)
	{
		var root = this.nodes.variableInputs
		
		for (var i = 0; i < fieldsSet.length; i++)
		{
			var field = fieldsSet[i]
			var label = N('label')
			var input = N('input')
			input.type = 'text'
			input.name = field
			
			label.appendChild(T(field + ':'))
			label.appendChild(input)
			
			root.appendChild(label)
		}
		
		this.nodes.formPopupNameInput.value = name
		this.nodes.form.variableFields = fieldsSet
	},
	
	showFormPopup: function ()
	{
		this.startFormChecker()
		this.nodes.formPopup.show()
		this.hideFormPopupThanks()
	},
	
	hideFormPopup: function ()
	{
		this.stopFormChecker()
		this.nodes.formPopup.hide()
	},
	
	showFormPopupThanks: function ()
	{
		this.stopFormChecker()
		this.nodes.formPopupFields.hide()
		this.nodes.formPopupThanks.show()
	},
	
	hideFormPopupThanks: function ()
	{
		this.startFormChecker()
		this.nodes.formPopupThanks.hide()
		this.nodes.formPopupFields.show()
	},
	
	setFormLock: function (status)
	{
		var button = this.nodes.formPopupSubmit
		status ? button.disable() : button.enable()
	},
	
	resetForm: function ()
	{
		this.nodes.form.reset()
		this.setFormLock(true)
	},
	
	startFormChecker: function ()
	{
		var me = this
		clearInterval(this.formCheckTimer)
		this.formCheckTimer = setInterval(function () { log('check'); me.owner.controller.formTimeCheck(me.nodes.form.toHash(), me.nodes.form.variableFields) }, 200)
	},
	
	stopFormChecker: function ()
	{
		clearInterval(this.formCheckTimer)
	}
}

})()}