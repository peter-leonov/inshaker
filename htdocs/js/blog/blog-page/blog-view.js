<!--# include virtual="/liby/core/fixes/onhashchange.js" -->
<!--# include virtual="/liby/modules/url-encode.js" -->
<!--# include virtual="/liby/modules/location-hash.js" -->
<!--# include virtual="/liby/modules/rus-date.js" -->

;(function(){

function Me ()
{
	this.nodes = {}
	this.lastTag = 'all'
	this.postPerPage = 20
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var me = this
		nodes.more.addEventListener('click', function (e) { me.addMorePosts() }, false)
					
		var lh = this.lh = new LocationHash().bind()
		lh.addEventListener('change', function (e) { me.addMorePosts() }, false)

		this.addMorePosts()
	},
	
	renderPosts: function (posts, left)
	{
		for (var i = 0, pi = posts.length; i < pi; i++)
		{
			var post = posts[i],
				li = Nc('li', 'post preview'),
				title = Nc('h2', 'title'),
				a = Nct('a', '', post.title)
				
			a.href = "/blog/" + post.path + "/#the-one"
			
			title.appendChild(a)
			li.appendChild(title)
			
			var body = Nc('div', 'body')
			body.innerHTML = post.html
			li.appendChild(body)
			
			var more = Nc('div', 'more'),
				tags = Nc('div', 'tags'),
				list = Nc('ul', 'list'),
				date = Nct('span', 'date', (new Date(parseInt(post.date)*1000)).toRusDate())
				
			more.appendChild(tags)
			more.appendChild(date)
			
			tags.appendChild(T('Теги: '))
			tags.appendChild(list)
			
			li.appendChild(more)
			
			for (var j = 0, jl = post.tags.length; j < jl; j++)
			{
				var tag = Nc('li', 'tag tag-' + Blog.getIndexByName(post.tags[j])),
					link = Nct('a', 'link', post.tags[j])
				
				link.href = "/blog/#tag=" + post.tags[j]
				
				tag.appendChild(link)
				list.appendChild(tag)
			}
			this.nodes.postsLoop.appendChild(li)
		}
		this.renderMoreButton(left)
	},
	
	renderNewPosts: function (posts, left)
	{
		this.nodes.postsLoop.empty()
		this.renderPosts(posts, left)
	},
	
	addMorePosts: function ()
	{
		var hash = UrlEncode.parse(this.lh.get())
		this.controller.addMorePosts(hash, this.postPerPage)
	},
	
	switchTag: function (key)
	{
		if (key < 0)
			key = 'all'
		
		var root = this.nodes.root
		
		root.removeClassName('show-tag-' + this.lastTag)
		root.addClassName('show-tag-' + key)
		this.lastTag = key
	},
	
	showMoreButton: function ()
	{
		var more = this.nodes.more
		
		if (more.hasClassName('hidden'))
			more.removeClassName('hidden')
	},
	
	hideMoreButton: function ()
	{
		var more = this.nodes.more
		
		if (!more.hasClassName('hidden'))
			more.addClassName('hidden')
	},
	
	renameMoreButton: function (count)
	{
		var more = this.nodes.more
		
		more.value = "еще " + count + " постов!"
		this.showMoreButton()
	},
	
	renderMoreButton: function (count)
	{
		var more = this.nodes.more
		
		count = Math.min(count, this.postPerPage)
		
		if (count < 1)
			this.hideMoreButton()
		
		else if(more.count != count)
			this.renameMoreButton(count)

		more.count = count
	}
}

Papa.View = Me

})();