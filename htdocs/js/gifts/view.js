function GiftsView (nodes, controller) 
{
    this.initialize = function (gifts, selectedGift)
    {
        this.renderPreviews(gifts)
        new Programica.RollingImagesLite(nodes.previewsRoot, {animationType: 'easeInOutQuad'})
        
        this.renderGift(selectedGift)
        new Programica.RollingImagesLite(nodes.promosRoot,{animationType: 'easeInOutQuad', duration:0.75}) 
    }
    
    this.renderGift = function (gift)
    {
        this.selectGift(gift)
        this.renderPromo(gift)
        this.renderPlaces(gift)
    }

    this.selectGift = function (gift)
    {
        var allGifts = nodes.previewsSurface.getElementsByClassName("gift")
        for (var i = 0; i < allGifts.length; i++)
        {
           if(allGifts[i].childNodes[1].innerHTML == gift.name)
            {
                allGifts[i].addClassName("selected")
                
                var mark = document.createElement("span")
                mark.className = "mark"
                allGifts[i].insertBefore(mark, allGifts[i].childNodes[0])
                nodes.previewsRoot.RollingImagesLite.goToNode(allGifts[i].parentNode, "directJump")
                break
            }
        }
    }

    this.renderPreviews = function (gifts)
    {
        var parent = nodes.previewsSurface, li = null
        for (var i = 0; i < gifts.length; i++)
        {
            if (i % 4 == 0)
            {
                li = document.createElement("li")
                li.className = "point"
                parent.appendChild(li)
            }
            var div  = document.createElement("div")
            div.className = "gift"
            var img  = document.createElement("img")
            img.src  = gifts[i].getMiniImgSrc()
            
            var a = document.createElement("a")
            a.className = "name"
            a.innerHTML = gifts[i].name
            
            div.appendChild(img)
            div.appendChild(a) 
            li.appendChild(div)
            var me = this; div.addEventListener('click', function (g)
            {
                return function() { me.controller.goToGift(g) }
            } (gifts[i]), false)
        }
    }

    this.renderPromo = function (gift)
    {
        nodes.fullName.innerHTML = gift.name_full
        var parent = nodes.promosSurface
        parent.empty()
        for (var i = 0; i < gift.big_images.length; i++)
        {
            var li = document.createElement("li")
            li.className = "point"
            var img = document.createElement("img")
            img.src = gift.big_images[i]
            li.appendChild(img)
            parent.appendChild(li)
        }
        if(gift.big_images.length < 2)
        {
            nodes.promosArrows[0].addClassName("hidden")
            nodes.promosArrows[1].addClassName("hidden")
        }
        nodes.price.src = gift.getImgSrc("-price.png")
        nodes.desc.empty()
        for (var i = 0; i < gift.desc.length; i++)
        {
            var p = document.createElement("p")
            p.innerHTML = gift.desc[i]
            nodes.desc.appendChild(p)
        }
    }

    this.renderPlaces = function (gift)
    {
        var parent = nodes.places
        parent.empty()
        for(var i = 0; i < gift.places.length; i++)
        {
            var div = document.createElement("div")
            div.className = "place"
            for(var name in gift.places[i])
            {   
                var details = gift.places[i][name]
                var title = document.createElement("h3")
                title.className = "title"
                var tlink = document.createElement("a")
                tlink.href = details[1]
                 
                title.appendChild(tlink)
                
                var wname = name, l = name.length
                if (name.substr(l-1,1) == "*") 
                {
                    wname = name.substr(0, l-1)
                    var ast = document.createElement("span")
                    ast.innerHTML = "*"
                    ast.className = "ast"
                    title.appendChild(ast)
                } 
                
                tlink.innerHTML = wname 
                div.appendChild(title)
                var address = document.createElement("span")
                address.innerHTML = details[0]
                address.className = "address"
                div.appendChild(address)
                var time = document.createElement("span")
                time.innerHTML = details[2]
                time.className = "time"
                div.appendChild(time)
                var tel = document.createElement("span")
                tel.innerHTML = details[3]
                tel.className = "tel"
                div.appendChild(tel)
            }  
            parent.appendChild(div)
        }
    }
}
