;(function(){

function Me ()
{
	this.nodes = {}
	this.lastTag = 'all'
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
		lh.addEventListener('change', function (e) { me.checkHash() }, false)
		
		this.controller.askForTagsList()
	},
	
	renderPosts: function (posts, left)
	{
		for (var i = 0, pi = posts.length; i < pi; i++)
		{
			var post = posts[i],
				li = Nc('li', 'post preview'),
				title = Nc('h2', 'title'),
				a = Nct('a', '', post.title)
			
			a.href = '/blog/' + post.path + '/#the-one'
			
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
				list.appendChild(this.renderTagLi(post.tags[j], Blog.getIndexByName(post.tags[j])))
				list.appendChild(T(' '))
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
	
	renderAddedPosts: function (posts, left)
	{
		this.renderPosts(posts, left)
	},
	
	checkHash: function ()
	{
		var hash = UrlEncode.parse(this.lh.get())
		this.controller.hashUpdated(hash)
	},
	
	addMorePosts: function ()
	{
		this.controller.addMorePosts()
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
		
		more.value = 'еще ' + count + ' постов!'
		this.showMoreButton()
	},
	
	renderMoreButton: function (count)
	{
		var more = this.nodes.more
		
		count = Math.min(count, this.postsPerPage)
		
		if (count < 1)
			this.hideMoreButton()
		
		else if (more.count != count)
			this.renameMoreButton(count)
		
		more.count = count
	},
	
	renderTagCloud: function (tags)
	{
		var cloud = this.nodes.tagCloud
		
		cloud.empty()
		
		var li = Nc('li', 'tag all'),
			link = Nct('a', 'link', 'все посты')
		
		link.href = '/blog/'
		li.appendChild(link)
		cloud.appendChild(li)
		cloud.appendChild(T(' '))
		
		for (var i = 0, il = tags.length; i < il; i++)
		{
			cloud.appendChild(this.renderTagLi(tags[i], i))
			cloud.appendChild(T(' '))
		}
	},
	
	renderTagLi: function(tag, index)
	{
		var li = Nc('li', 'tag tag-' + index),
			link = Nct('a', 'link', tag)
		
		link.href = '/blog/#tag=' + tag
		
		li.appendChild(link)
		
		return li
	},
	
	setPostsPerPage: function (count)
	{
		this.postsPerPage = count
	}
}

Papa.View = Me

})();
