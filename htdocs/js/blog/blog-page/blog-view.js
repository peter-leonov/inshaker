<!--# include virtual="/liby/modules/rus-date.js" -->

;(function(){

function Me ()
{
	this.nodes = {}
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		this.controller.renderPosts()
	},
	
	renderPosts: function (posts)
	{
		for (var i = 0, pi = posts.length; i < pi; i++)
		{
			var post = posts[i]
				li = Nc('li', 'post preview'),
				h2 = Nc('h2', 'title'),
				a = Nct('a', '', post.title)
			
			a.href = "/" + post.path + '/#the-one'
			
			h2.appendChild(a)
			li.appendChild(h2)
				
			var body = Nc('div', 'body'),
				p = N('p'),
				imageBox = Nc('div', 'image-box'),
				a2 = N('a'),
				img = Nc('img', 'image')
			
			a2.href = a.href
			
			img.src = post.img
			img.width = "590"
			img.height = "320"
			
			a2.appendChild(img)
			imageBox.appendChild(a2)
			p.appendChild(imageBox)
			body.appendChild(p)
			li.appendChild(body)
			
			var tagName = Blog.getByIndex(post.tag_key[0]).name
				more = Nc('div', 'more'),
				tags = Nc('div', 'tags'),
				tagsLabel = T('Теги: '),
				ul = Nc('ul', 'list'),
				tag = Nc('li', 'tag'),
				a3 = Nct('a', 'link', tagName),
				date = Nct('span', 'date', (new Date(parseInt(post.date)*1000)).toRusDate())
				
			a3.href="#tag="+tagName
			
			tag.appendChild(a3)
			ul.appendChild(tag)
			tags.appendChild(tagsLabel)
			tags.appendChild(ul)
			more.appendChild(tags)
			more.appendChild(date)
			li.appendChild(more)
			
			this.nodes.postsLoop.appendChild(li)
		}
	}
}

Papa.View = Me

})();