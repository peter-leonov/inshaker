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
		
		var controller = this.controller
		nodes.more.addEventListener('click', function (e) { controller.addMorePosts() }, false)
		
		var lh = this.lh = new LocationHash().bind()
		var me = this
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
			
			a.href = post.getRoot() + '#the-one'
			
			title.appendChild(a)
			li.appendChild(title)
			
			var body = Nc('div', 'body')
			body.innerHTML = post.snippet
			li.appendChild(body)
			
			var more = Nc('div', 'more'),
				tags = Nc('div', 'tags'),
				list = Nc('ul', 'list'),
				
			more.appendChild(tags)
			var date = Nct('span', 'date', new Date(post.date * 1000).toRusDate())
			more.appendChild(date)
			
			tags.appendChild(T('Теги: '))
			tags.appendChild(list)
			
			li.appendChild(more)
			
			for (var j = 0, jl = post.tags.length; j < jl; j++)
			{
				list.appendChild(this.renderTagLi(post.tags[j]))
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
	
	switchTag: function (tag)
	{
		var key = tag == 'all' ? tag : this.tagIndexByTagName[tag]
		
		var root = this.nodes.root
		root.removeClassName('show-tag-' + this.lastTagKey)
		root.addClassName('show-tag-' + key)
		this.lastTagKey = key
	},
	
	showMoreButton: function ()
	{
		this.nodes.more.removeClassName('hidden')
	},
	
	hideMoreButton: function ()
	{
		this.nodes.more.addClassName('hidden')
	},
	
	renameMoreButton: function (count)
	{
		this.nodes.more.value = 'еще ' + count + ' ' + count.plural('пост', 'поста', 'постов') + '!'
	},
	
	renderMoreButton: function (count)
	{
		if (count <= 0)
		{
			this.hideMoreButton()
			return
		}
		
		this.showMoreButton()
		this.renameMoreButton(Math.min(count, this.postsPerPage))
	},
	
	eatAllTags: function (tags)
	{
		var index = this.tagIndexByTagName = {}
		
		for (var i = 0, il = tags.length; i < il; i++)
			index[tags[i]] = i
		
		this.renderTagCloud(tags)
	},
	
	renderTagCloud: function (tags)
	{
		var cloud = this.nodes.tagCloud
		
		for (var i = 0, il = tags.length; i < il; i++)
		{
			cloud.appendChild(this.renderTagLi(tags[i]))
			cloud.appendChild(T(' '))
		}
	},
	
	renderTagLi: function(tag)
	{
		var li = Nc('li', 'tag tag-' + this.tagIndexByTagName[tag]),
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
