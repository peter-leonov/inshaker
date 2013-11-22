;(function(){

function getIntegerValue (v)
{
  // to string
  v = '' + v
  // clean up all non-digital chars
  v = v.replace(/,/g, '.')
  v = v.replace(/[^0-9\-\.]+/g, '')
  // convert to number base 10
  v = parseFloat(v, 10)
  // convert NaN to 0
  v = isNaN(v) ? 0 : v
  
  // here is the difference
  return Math.ceil(v)
}

function getFloatValue (v)
{
  // to string
  v = '' + v
  // clean up all non-digital chars
  v = v.replace(/,/g, '.')
  v = v.replace(/[^0-9\-\.]+/g, '')
  // convert to number base 10
  v = parseFloat(v, 10)
  // convert NaN to 0
  v = isNaN(v) ? 0 : v
  
  return v
}


function PartyPageView ()
{
  this.nodes = {}
  this.cache = {portions: [], plan: []}
}

eval(NodesShortcut.include())

PartyPageView.prototype =
{
  bind: function (nodes)
  {
    this.nodes = nodes
    
    this.checkOGImage()
    
    this.loadWindow()
    this.bindGoodPopup()
    this.bindEvents()
    this.bindShareBox()
    this.bindPrintBox()
    
    this.renderRecipeIngredientPreviews()
    
    return this
  },
  
  checkOGImage: function ()
  {
    var nodes = this.nodes
    
    var rex = /\/party\/([^\/]+)\//
    
    var og = rex.exec(nodes.ogImage.content)
    if (!og)
    {
      log('og:image path is totally wrong')
      return
    }
    og = og[1]
    
    var my = rex.exec(location.href)
    my = my[1]
    
    
    if (og != my)
      log('fix the og:image path')
  },
  
  loadWindow: function ()
  {
    var nodes = this.nodes.window,
      images = nodes.images
    
    var me = this, count = 0
    function onload ()
    {
      count++
      
      nodes.bar.style.width = Math.ceil(count / images.length * 100) + '%'
      
      if (count < images.length)
        return
      
      me.bindWindow()
    }
    
    for (var i = 0, il = images.length; i < il; i++)
    {
      var image = images[i]
      image.addEventListener('load', onload, false)
      image.src = image.getAttribute('lazy-src')
    }
  },
  
  bindWindow: function ()
  {
    var nodes = this.nodes.window,
      root = nodes.root, layers = nodes.layers
    
    var factors = []
    for (var i = 0, il = layers.length; i < il; i++)
      factors[i] = layers[i].getAttribute('data-factor') * 0.5
    
    var ww = root.offsetWidth,
      lw = layers[0].scrollWidth
    
    var middle = (lw - ww) * 0.5
    
    var left = root.offsetLeft
    
    var lastDx
    function position (dx)
    {
      if (lastDx == dx)
        return
      lastDx = dx
      
      root.className = 'rendering'
      for (var i = 0, il = layers.length; i < il; i++)
        layers[i].scrollLeft = middle + dx * factors[i]
      root.className = ''
    }
    
    function move (e)
    {
      var x = e.clientX - left
      var dx = Math.round(x / ww * lw - lw * 0.5)
      position(dx)
    }
    
    root.addEventListener('mousemove', move, false)
    position(0)
    root.classList.remove('loading')
  },
  
  bindGoodPopup: function ()
  {
    var nodes = this.nodes
    
    var controller = this.controller
    function maybeGoodClicked (e)
    {
      var name = e.target.findParent(function (n) { return n.getAttribute('data-good') }, /*deep=*/ 3)
      if (name)
        controller.goodSelected(name)
    }
    
    nodes.root.addEventListener('click', maybeGoodClicked, false)
  },
  
  showGoodPopup: function (good)
  {
    IngredientPopup.show(good)
  },
  
  bindEvents: function ()
  {
    var nodes = this.nodes
    
    function blurInteger (e)
    {
      var target = e.target
      target.value = getIntegerValue(target.value)
    }
    
    function blurFloat (e)
    {
      var target = e.target
      target.value = getFloatValue(target.value)
    }
    
    function ifReallyChanged (e, f)
    {
      var target = e.target
      
      var before = target.value
      function after ()
      {
        if (before != target.value)
          f()
      }
      window.setTimeout(after, 0)
    }
    
    var view = this
    nodes.peopleCount.addEventListener('keypress', function (e) { ifReallyChanged(e, function () { view.peopleCountChanged(e) }) }, false)
    nodes.peopleCount.addEventListener('blur', blurInteger, true)
    nodes.portions.addEventListener('keypress', function (e) { ifReallyChanged(e, function () { view.cocktailCountChanged(e) }) }, false)
    nodes.portions.addEventListener('blur', blurInteger, true)
    
    nodes.purchasePlan.addEventListener('keypress', function (e) { ifReallyChanged(e, function () { view.ingredientAmountChanged(e) }) }, false)
    nodes.purchasePlan.addEventListener('blur', blurFloat, true)
  },
  
  peopleCountChanged: function (e)
  {
    this.controller.peopleCountChanged(getIntegerValue(e.target.value))
  },
  
  cocktailCountChanged: function (e)
  {
    var target = e.target
    
    var num = target.dataInListNumber
    if (num == undefined)
      return
    
    this.controller.cocktailCountChanged(target.dataInListNumber, getIntegerValue(target.value))
  },
  
  ingredientAmountChanged: function (e)
  {
    var target = e.target
    this.controller.ingredientAmountChanged(target.dataGoodName, getFloatValue(target.value))
  },
  
  renderPortions: function (portions)
  {
    var root = this.nodes.portions,
      cache = this.cache,
      portionsCache = cache.portions
    
    for (var i = 0, il = portions.length; i < il; i++)
    {
      var cocktail = portions[i].cocktail
      
      var portion = Nc('li', 'portion')
      
      var name = Nc('h3', 'name')
      portion.appendChild(name)
      
      var link = Nct('a', 'link', cocktail.name)
      link.href = cocktail.getPath()
      name.appendChild(link)
      
      var imageBox = Nc('span', 'image-box')
      link.appendChild(imageBox)
      
      var image = Nc('img', 'image')
      imageBox.appendChild(image)
      image.src = cocktail.getBigCroppedImageSrc()
      
      var count = Nc('div', 'count')
      portion.appendChild(count)
      
      var value = Nc('input', 'value')
      count.appendChild(value)
      value.dataInListNumber = i
      
      count.appendChild(T(' '))
      
      var unit = Nct('span', 'unit', ' ')
      count.appendChild(unit)
      
      // cache for updatePortions()
      portionsCache[i] =
      {
        value: value,
        unit: unit.firstChild
      }
      
      var ingredientsNode = Nc('ul', 'ingredients')
      portion.appendChild(ingredientsNode)
      
      var parts = cocktail.parts
      for (var j = 0, jl = parts.length; j < jl; j++)
      {
        var ingredient = parts[j].ingredient
        
        var ingredientNode = Nct('li', 'ingredient', ingredient.getBrandedName())
        ingredientsNode.appendChild(ingredientNode)
        
        ingredientNode.setAttribute('data-good', ingredient.name)
        ingredientsNode.appendChild(ingredientNode)
      }
      
      root.appendChild(portion)
    }
  },
  
  updatePortions: function (portions)
  {
    var portionsCache = this.cache.portions
    
    for (var i = 0, il = portions.length; i < il; i++)
    {
      var portion = portions[i]
      
      var c = portionsCache[i]
      c.value.value = portion.count
      c.unit.nodeValue = portion.count.pluralA(portion.cocktail.getPlurals())
    }
  },
  
  renderPlan: function (plan)
  {
    var nodes = this.nodes
    
    var byGroup =
    {
      tools: [],
      ingredients: [],
      things: []
    }
    
    for (var i = 0, il = plan.length; i < il; i++)
    {
      var buy = plan[i]
      byGroup[buy.group].push(buy)
    }
    
    var plan = byGroup.ingredients
    this.renderIngredientsPlan(plan)
    this.renderIngredientsPreviewList(plan)
    
    var plan = byGroup.tools
    this.renderToolsPlan(plan)
    this.renderToolsPreviewList(plan)
    
    var plan = byGroup.things
    this.renderThingsPlan(plan)
    this.renderThingsPreviewList(plan)
  },
  
  renderIngredientsPlan: function (plan)
  {
    this.renderPlanTo(plan, this.nodes.ingredients)
  },
  
  renderToolsPlan: function (plan)
  {
    this.renderPlanTo(plan, this.nodes.tools)
  },
  
  renderThingsPlan: function (plan)
  {
    this.renderPlanTo(plan, this.nodes.things)
  },
  
  renderPlanTo: function (plan, section)
  {
    var root = section.root
    if (plan.length == 0)
    {
      root.hide()
      return
    }
    else
    {
      root.show()
    }
    
    var list = section.list
    list.empty()
    
    var planCache = this.cache.plan
    for (var i = 0, il = plan.length; i < il; i++)
    {
      var buy = plan[i],
        good = buy.good,
        cache = planCache[good.name] = {}
      
      var item = Nc('li', 'ingredient')
      list.appendChild(item)
      cache.item = item
      
      var name = Nct('span', 'name', good.getBrandedName())
      item.appendChild(name)
      name.setAttribute('data-good', good.name)
      
      
      var amount = Nc('span', 'amount')
      item.appendChild(amount)
      
      var value = Nc('input', 'value')
      value.setAttribute('readonly', 'true')
      amount.appendChild(value)
      value.dataGoodName = good.name
      cache.amount = value
      
      amount.appendChild(T(' '))
      
      var unit = Nct('span', 'unit', ' ')
      amount.appendChild(unit)
      cache.unit = unit.firstChild
      
      
      var cost = Nc('span', 'cost')
      item.appendChild(cost)
      
      var value = Nct('span', 'value', ' ')
      cost.appendChild(value)
      cache.cost = value.firstChild
      
      cost.appendChild(T(' '))
      
      var unit = Nct('span', 'unit', ' ')
      cost.appendChild(unit)
      cache.currency = unit.firstChild
    }
  },
  
  renderIngredientsPreviewList: function (plan)
  {
    this.renderPreviewListTo(plan, this.nodes.ingredients.previewList)
  },
  
  renderToolsPreviewList: function (plan)
  {
    this.renderPreviewListTo(plan, this.nodes.tools.previewList)
  },
  
  renderThingsPreviewList: function (plan)
  {
    this.renderPreviewListTo(plan, this.nodes.things.previewList)
  },
  
  renderPreviewListTo: function (plan, root)
  {
    root.empty()
    
    var planCache = this.cache.plan
    for (var i = 0, il = plan.length; i < il; i++)
    {
      var good = plan[i].good,
        cache = planCache[good.name]
      
      var item = Nc('li', 'item ingredient-preview')
      root.appendChild(item)
      cache.preview = item
      item.setAttribute('data-good', good.name)
      item.style.backgroundImage = 'url(' + good.getMiniImageSrc() + ')'
      
      var image = Nc('img', 'image')
      item.appendChild(image)
      image.src = good.getMiniImageSrc()
      
      var name = Nct('span', 'name', good.screenName())
      item.appendChild(name)
    }
  },
  
  updatePlan: function (plan)
  {
    var planCache = this.cache.plan
    
    for (var i = 0, il = plan.length; i < il; i++)
    {
      var buy = plan[i],
        item = planCache[buy.good.name]
      
      if (buy.amount == 0)
      {
        item.item.hide()
        item.preview.hide()
        continue
      }
      else
      {
        item.item.show()
        item.preview.show()
      }
      
      var human = Units.humanizeDose(buy.amount, buy.good.unit)
      
      item.amount.value = buy.amountHumanized
      item.unit.nodeValue = buy.unitHumanized
      
      this.updateBuy(buy.good.name, buy)
    }
  },
  
  updateTotal: function (total, person)
  {
    var totalNodes = this.nodes.purchasePlanTotal
    
    var perParty = totalNodes.perParty
    perParty.value.firstChild.nodeValue = total
    perParty.unit.firstChild.nodeValue = total.plural('рубль', 'рубля', 'рублей')
    
    var perPerson = totalNodes.perPerson
    perPerson.value.firstChild.nodeValue = person
    perPerson.unit.firstChild.nodeValue = person.plural('рубль', 'рубля', 'рублей')
  },
  
  updateBuy: function (name, buy)
  {
    var planCache = this.cache.plan
    
    var item = planCache[name]
    if (buy.cost)
    {
      item.cost.nodeValue = buy.cost
      item.currency.nodeValue = 'р.'
    }
    else // for free
    {
      item.cost.nodeValue = ''
      item.currency.nodeValue = 'дарим'
    }
  },
  
  renderPeopleCount: function (count)
  {
    this.nodes.peopleCount.value = count
  },
  
  updatePeopleUnit: function (count)
  {
    this.nodes.peopleUnit.firstChild.nodeValue = count.plural('человека', 'человека', 'человек')
  },
  
  updateUnit: function (n, portion)
  {
    var p = this.cache.portions[n]
    p.unit.nodeValue = portion.count.pluralA(portion.cocktail.getPlurals())
  },
  
  bindShareBox: function ()
  {
    var nodes = this.nodes
    
    var share = new ShareBox()
    share.bind(nodes.shareBox)
    share.render(window.location.href, nodes.partyName.firstChild.nodeValue)
  },
  
  bindPrintBox: function ()
  {
    var nodes = this.nodes
    
    var controller = this.controller
    nodes.printButton.addEventListener('click', function () { controller.printParty() }, false)
  },
  
  printParty: function (party)
  {
    window.print()
    Statistics.partyPrinted(party)
  },
  
  guessParty: function ()
  {
    var name = this.nodes.partyName.getAttribute('data-value')
    this.controller.partyNameGuessed(name)
  },
  
  renderRecipes: function (portions)
  {
    var list = this.nodes.recipeList
    
    for (var i = 0, il = portions.length; i < il; i++)
    {
      var cocktail = portions[i].cocktail
      
      var recipe = Nc('li', 'recipe')
      
      var name = recipe.appendChild(Nc('h3', 'name'))
      name.appendChild(T('Приготовь '))
      var link = name.appendChild(Nct('a', 'link', cocktail.name))
      link.href = cocktail.getPath()
      
      var imageBox = recipe.appendChild(Nc('div', 'image-box'))
      var link = imageBox.appendChild(Nc('a', 'link'))
      link.href = cocktail.getPath()
      var img = link.appendChild(Nc('img', 'image'))
      img.src = cocktail.getBigCroppedImageSrc()
      
      var ingredients = recipe.appendChild(Nc('ul', 'ingredients'))
      for (var j = 0, jl = cocktail.parts.length; j < jl; j++)
      {
        var part = cocktail.parts[j]
        
        var ingredientPreview = ingredients.appendChild(Nc('li', 'ingredient-preview'))
        ingredientPreview.setAttribute('data-good', part.ingredient.name)
        ingredientPreview.style.backgroundImage = 'url(' + part.ingredient.getMiniImageSrc() + ')'
      }
      
      var instructions = recipe.appendChild(Nc('ol', 'instructions'))
      instructions.appendChild(Nct('h4', 'head', 'Как приготовить:'))
      for (var j = 0, jl = cocktail.receipt.length; j < jl; j++)
      {
        var step = cocktail.receipt[j]
        
        var instruction = instructions.appendChild(Nc('li', 'instruction'))
        instruction.appendChild(Nct('span', 'text', step))
      }
      
      list.appendChild(recipe)
    }
    
  },

  renderRecipeIngredientPreviews: function ()
  {
    var previews = this.nodes.recipeIngredientPreviews
    
    for (var i = 0, il = previews.length; i < il; i++)
    {
      var preview = previews[i]
      
      var good = Ingredient.getByName(preview.getAttribute('data-good'))
      if (!good)
        return
      
      preview.style.backgroundImage = 'url(' + good.getMiniImageSrc() + ')'
    }
  },
  
  renderPartyList: function (parties)
  {
    var list = this.nodes.partyList
    
    list.empty()
    
    for (var i = 0, il = parties.length; i < il; i++)
    {
      var party = parties[i]
      
      var item = Nc('li', 'item')
      list.appendChild(item)
      
      var link = Nc('a', 'party')
      item.appendChild(link)
      link.href = party.getPath()
      link.style.backgroundImage = 'url(' + party.getPreviewImage() + ')'
      
      var name = Nct('span', 'name', party.name)
      link.appendChild(name)
    }
  }
}

Papa.View = PartyPageView

})();
