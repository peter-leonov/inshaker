{(function(){

var doc = document
function N (name, classN) { var res = doc.createElement(name); if(classN) res.className = classN; return res; }
function T (text) { return doc.createTextNode(text) }

Number.prototype.toTime = function ()
{
	var m = /([+\-]?\d+)(?:\.(\d+))?/.exec(this) //.oString var mins = this & -1,
	return m[1] + ':' + (m[2] === undefined ? '00' : (m[2].length <= 1 ? '0' + m[2] : m[2]))
}

Date.prototype.getFormatted = function(withYear){
	var weekdays = ["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"]
	var months = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"] 
	return this.getDate() + " " + months[this.getMonth()] + (withYear ? " " + this.getFullYear() : ", " + weekdays[this.getDay()])
}


EventPage.view =
{
	owner: null, // must be defined before initialize
	
	initialize: function (nodes)
	{
		this.nodes = nodes
		var me = this,
			controller = this.owner.controller
	},
	
	bindRaiting: function ()
	{
		var me = this, nodes = this.nodes,
			controller = this.owner.controller
		
		nodes.ratingShowAll.addEventListener('click', function () { controller.ratingShowAllClicked() }, false)
		
		nodes.ratingShowAll.hide = nodes.formPopupFields.hide = nodes.formPopupThanks.hide = function () { this.style.visibility = 'hidden' }
		nodes.ratingShowAll.show = nodes.formPopupFields.show = nodes.formPopupThanks.show = function () { this.style.visibility = 'visible' }
	},
	
	bindFormPopup: function ()
	{
		var me = this, nodes = this.nodes,
			controller = this.owner.controller
		
		function formPopupCloseClicked () { controller.formPopupCloseClicked() }
		nodes.formPopupOverlay.addEventListener('click', formPopupCloseClicked, false)
		nodes.formPopupMenu.addEventListener('click', formPopupCloseClicked, false)
		
		function formPopupOpenClicked () { controller.formPopupOpenClicked() }
		nodes.getInvitation.forEach(function (v) { if (v) v.addEventListener('click', formPopupOpenClicked, false) })
		
		
		function sendListener (e)
		{
			e.preventDefault()
			
			controller.formSend()
			
			function sent ()
			{
				if (this.statusType == 'success')
				{
					controller.formSuccess()
				}
				else
				{
					alert('Произошла ошибка! Пожалуйста, сообщите о ней по адресу support@inshaker.ru')
				}
				
				controller.formLoad()
			}
			
			Request.post(this.action, FormHelper.toHash(this), sent)
		}
		nodes.form.addEventListener('submit', sendListener,  false)
	},
	
	readEvent: function ()
	{
		var name = this.nodes.name.getAttribute('data-name') || this.nodes.name.firstChild.nodeValue
		this.owner.controller.setEventName(name)
	},
	
	modelChanged: function (event, previewSet)
	{
		this.event = event
		this.root = event.pageHref()
		
		this.bindRaiting()
		
		if (event.status == 'preparing')
			this.bindFormPopup()
		
		this.renderPreviews(previewSet, event)
		
		this.renderDialogue(event.dialogue)
		this.renderRating(event.rating)
		this.renderRatingHead(event.rating)
		this.renderLowSponsors(event.low)
		this.renderMediumSponsors(event.medium)
		this.renderHighSponsors(event.high)
		this.setupForm(event)
		// this.showFormPopup()
		// this.showFormPopupThanks()
		this.setFormLock(true)
	},
	
	renderPreviews: function(events, selectedEvent)
	{
		var surface = this.nodes.previewSurface, previews = this.nodes.previews
		
		events = events.sort(Event.dateSort)
		
		// find nearest
		var now = new Date(),
			past = [], future = []
		for (var i = 0; i < events.length; i++)
		{
			var event = events[i]
			if (event.date < now)
				past.push(event)
			else
				future.push(event)
		}
		
		surface.empty()
		var pointNum = -1, pastDiff = 4 - past.length % 4
		
		for (var i = 0; i < past.length; i++)
		{
			var event = past[i],
				selected = selectedEvent == event
			
			if (!point || (i + pastDiff) % 4 == 0)
			{
				pointNum++
				var point = N('li', 'point past')
				surface.appendChild(point)
			}
			if (selected)
				var selectedPoint = pointNum
				
			point.appendChild(this.createPreviewElement(event, selected))
		}
		
		
		for (var i = 0; i < future.length; i++)
		{
			var event = future[i],
				selected = selectedEvent == event
			
			if (i % 4 == 0)
			{
				pointNum++
				var point = N('li', 'point future')
				surface.appendChild(point)
			}
			if (selected)
				var selectedPoint = pointNum
				
			point.appendChild(this.createPreviewElement(event, selected))
		}
		
		new RollingImagesLite(previews, {animationType: 'easeOutQuad', goInit: false}).jumpToFrame(selectedPoint)
	},
	
	createPreviewElement: function(event, selected)
	{   
		var main
		
		if (selected)
		{
			main = N('span', 'event selected')
			main.appendChild(N('span', 'mark'))
		}
		else
		{
			main = N('a', 'event')
			main.href = event.pageHref()
		}
		
		var mini = N('span', 'mini')
		mini.style.backgroundImage = 'url(' + event.pageHref() + '/preview.jpg)'
		
		var mask = N('span', 'mask')
		mini.appendChild(mask)
		main.appendChild(mini)
		
		var date = N('span', 'date')
		date.appendChild(T(event.adate || event.date.getFormatted()))
		main.appendChild(date)
		
		var desc = N('span', 'desc')
		desc.appendChild(T(event.name))
		main.appendChild(desc)
		
		return main
	},
	
	renderLowSponsors: function (sponsorsSet)
	{
		if (sponsorsSet.length == 0)
		{
			return
		}
		
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
		sponsorsSet.unshift({name: '*', logos: all})
		
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
			
			new RollingImagesLite(node, {animationType: 'easeOutQuad'})
			dd.hide = function () { this.style.visibility = 'hidden' }
			dd.show = function () { this.style.visibility = 'visible' }
		}
		
		var spacer = N('dt')
		spacer.className = 'spacer'
		spacer.appendChild(T(' '))
		main.appendChild(spacer)
		
		Switcher.bind(main, buttons, tabs)
		main.select(0)
		
		this.nodes.sponsorsLow.addClassName('visible')
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
			
			if (logo)
			{
				var a = N('a')
				a.href = logo.href
				point.appendChild(a)
				point.appendChild(T(' '))
				
				var img = N('img')
				a.appendChild(img)
				img.src = this.root + '/logos/' + logo.src
			}
			else
			{
				point.appendChild(N('b')).appendChild(T(' '))
			}
			
			
			
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
			root = nodes.rating
		
		
		var data = rating.data, type = rating.type, sorted = Object.keys(data), max, min
		
		if (rating.reverse)
		{
			// a - b
			sorted = sorted.sort(function (a, b) { return data[a] - data[b] || a.localeCompare(b) })
			max = data[sorted[sorted.length-1]],
			min = data[sorted[0]]
		}
		else
		{
			// b - a
			sorted = sorted.sort(function (a, b) { return data[b] - data[a] || a.localeCompare(b) }),
			max = data[sorted[0]],
			min = data[sorted[sorted.length-1]]
		}
		
		var k = max > min ? 100 / (max - min) : 0 // 100 means 100%
		
		root.empty()
		
		var labels = N('div', 'labels'),
			rates = N('div', 'rates')
		
		root.appendChild(labels)
		root.appendChild(rates)
		
		for (var i = 0; i < sorted.length; i++)
		{
			var name = sorted[i],
				count = data[name],
				text = type === 'comp' ? count.toTime() : count.toString(),
				start = text.length * 3.4, // means 3.4% for a digit
				width = Math.floor((count - min) * k)
			
			if (width < start)
				width = start
			
			var label = N('div', 'label')
			label.appendChild(T(name))
			labels.appendChild(label)
			
			var rate = N('div', 'rate')
			rate.style.width = start + '%'
			rate.animate('easeInOutQuad', {width: [start, width]}, 1, '%')
			rate.appendChild(T(text))
			rates.appendChild(rate)
		}
		
		Humanize.adjustTextSizeOfNodes(labels, 'div')
		
		if (sorted.length > rating.max)
		{
			root.style.height = rating.max * 18 + 'px'
			this.nodes.ratingShowAll.show()
		}
		
		nodes.sidebar.addClassName('visible')
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
		
		if (rating.type == 'comp')
		{
			for (var k in data)
				totalPeople++
		}
		else
			for (var k in data)
				totalPeople += data[k],
				totalFrom++
		
		var ratingHead = this.nodes.ratingHead
		if (rating.phrase)
			ratingHead.innerHTML = rating.phrase.interpolate({people: totalPeople, from: totalFrom})
	},
	
	renderMediumSponsors: function (sponsorsSet)
	{
		var root = this.nodes.sponsorsMedium
		root.empty()
		
		for (var i = 0; i < sponsorsSet.length; i++)
		{
			var sponsor = sponsorsSet[i]
			
			var a = N('a')
			a.className = 'sponsor'
			a.href = sponsor.href
			
			var img = N('img')
			img.src = this.root + '/logos/' + sponsor.src
			img.alt = sponsor.name
			a.appendChild(img)
			
			root.appendChild(a)
		}
	},
	
	renderHighSponsors: function (sponsorsSet)
	{
		var nodes = this.nodes
		
		var sponsor = sponsorsSet[0]
		if (sponsor)
		{
			if (nodes.sponsorsHighTitle)
				nodes.sponsorsHighTitle.innerHTML = sponsor.name
			nodes.sponsorsHigh.style.backgroundImage = 'url(' + this.root + '/logos/' + sponsor.src + ')'
			nodes.sponsorsHigh.href = sponsor.href
			nodes.sidebar.addClassName('visible')
		}
		else
		{
			nodes.sponsorsHighBlock.hide()
		}
	},
	
	renderDialogue: function (dialogue)
	{
		dialogue = dialogue ? dialogue[Math.floor(dialogue.length * Math.random())] || dialogue[0] : null
			
		var nodes = this.nodes,
			illustration = nodes.illustration,
			illustrationPopups = nodes.illustrationPopups
		
		if (!dialogue)
			return illustration.remove()
		
		illustration.style.backgroundImage = 'url(' + this.root + '/dialogues/' + dialogue.back + ')'
		
		if (dialogue.popups)
		{
			illustrationPopups.src = this.root + '/dialogues/' + dialogue.popups
			
			function animatePopups ()
			{
				illustrationPopups.addClassName('hidden')
				window.setTimeout
				(
					function ()
					{ 
						if (illustration.scrollTop + 300 >= illustration.scrollHeight)
							illustration.scrollTop = 0
						else
							illustration.scrollTop += 300
						
						illustrationPopups.removeClassName('hidden')
					},
					500
				)
			}
			
			window.setInterval(animatePopups, 3200)
		}
		else
			illustrationPopups.remove()
	},
	
	setupForm: function (event)
	{
		var fieldsSet = event.fields
		if (!fieldsSet)
			return
		
		var nodes = this.nodes
		
		var root = nodes.variableInputs
		
		var variableFields = nodes.form.variableFields = []
		
		var inputs = []
		for (var i = 0; i < fieldsSet.length; i++)
		{
			var field = fieldsSet[i]
			
			var label = N('label')
			label.appendChild(N('span', 'label')).appendChild(T(field.label + ':'))
			
			var input
			if (field.type == 'textarea')
			{
				input = N('textarea')
				label.addClassName('big')
			}
			else
			{
				input = N('input')
				input.type = 'text'
			}
			
			inputs[i] = input
			
			input.name = field.name || field.label
			variableFields.push(input.name)
			label.appendChild(input)
			
			var t = field.tip
			if (t)
			{
				// input.value = t
				var tip = N('span', 'tip')
				tip.appendChild(T(t))
				label.appendChild(tip)
			}
			
			root.appendChild(label)
		}
		
		new InputTip().bind(inputs)
		
		var thanks = nodes.formPopupThanks
		if (!thanks.hasClassName('default'))
		{
			var input = inputs[i] = N('input')
			input.type = 'hidden'
			input.name = 'sent-message'
			input.value = thanks.innerHTML
			
			root.appendChild(input)
		}
		
		nodes.formPopupNameInput.value = event.name
		nodes.formPopupHrefInput.value = event.href
	},
	
	showFormPopup: function ()
	{
		this.startFormChecker()
		this.nodes.formPopup.show()
		this.nodes.formPopupContent.style.top = (document.documentElement.scrollTop || document.body.scrollTop) + 'px'
		// this.hideFormPopupThanks()
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
		if (status)
		{
			button.addClassName('disabled')
			button.setAttribute('disabled', true)
		}
		else
		{
			button.removeAttribute('disabled')
			button.removeClassName('disabled')
		}
	},
	
	startFormChecker: function ()
	{
		var me = this
		window.clearInterval(this.formCheckTimer)
		this.formCheckTimer = window.setInterval(function () { me.owner.controller.formTimeCheck(FormHelper.toHash(me.nodes.form), me.nodes.form.variableFields) }, 200)
	},
	
	stopFormChecker: function ()
	{
		window.clearInterval(this.formCheckTimer)
	}
}

})()}
