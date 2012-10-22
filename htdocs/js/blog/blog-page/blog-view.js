;(function(){

function Me ()
{
	this.nodes = {}
	this.cache = {posts: []}
}

eval(NodesShortcut.include())

Me.prototype =
{
	bind: function (nodes)
	{
		this.nodes = nodes
		
		var controller = this.controller
		nodes.moreButton.addEventListener('click', function (e) { controller.addMorePosts() }, false)
		
		this.tagCloud = new TagCloud({root: nodes.tagCloud})
		
		var lh = this.lh = new LocationHash().bind()
		var me = this
		lh.addEventListener('change', function (e) { me.hashUpdated() }, false)
	},
	
	renderPosts: function (posts, left)
	{
		var root = this.nodes.postsLoop
		
		for (var i = 0, pi = posts.length; i < pi; i++)
			root.appendChild(this.getPostNode(posts[i]))
		
		this.renderMoreButton(left)
	},
	
	getPostNode: function (post)
	{
		var cache = this.cache.posts
		
		var node = cache[post.id]
		if (node)
			return node
		
		return cache[post.id] = this.renderPost(post)
	},
	
	renderPost: function (post)
	{
		var preview = Nc('li', 'post preview')
		
		var title = Nc('h2', 'title')
		preview.appendChild(title)
		
		var a = Nct('a', '', post.title)
		a.href = post.getRoot() + '#the-one'
		title.appendChild(a)
		
		var body = Nc('div', 'body')
		body.innerHTML = post.snippet
		preview.appendChild(body)
		
		
		var more = Nc('div', 'more')
		preview.appendChild(more)
		
		var tags = Nc('div', 'tags')
		more.appendChild(tags)
		
		var date = Nct('span', 'date', new Date(post.date * 1000).toRusDate())
		more.appendChild(date)
		
		tags.appendChild(T('Теги: '))
		
		var list = Nc('ul', 'list')
		tags.appendChild(list)
		
		var postTags = post.tags
		for (var j = 0, jl = postTags.length; j < jl; j++)
		{
			list.appendChild(this.tagCloud.renderItem(postTags[j]))
			list.appendChild(T(' '))
		}
		
		return preview
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
	
	hashUpdated: function ()
	{
		window.scrollTo(0, 0)
		
		var hash = UrlEncode.parse(this.lh.get())
		this.controller.hashUpdated(hash)
	},
	
	switchTag: function (tag)
	{
		var key = tag == 'all' ? tag : this.tagCloud.getTagIndex(tag)
		
		var root = this.nodes.root
		root.classList.remove('show-tag-' + this.lastTagKey)
		root.classList.add('show-tag-' + key)
		this.lastTagKey = key
	},
	
	showMoreButton: function ()
	{
		this.nodes.more.show()
	},
	
	hideMoreButton: function ()
	{
		this.nodes.more.hide()
	},
	
	renameMoreButton: function (count)
	{
		this.nodes.morePosts.firstChild.nodeValue = count + ' ' + count.plural('пост', 'поста', 'постов')
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
		this.tagCloud.setTags(tags)
		this.tagCloud.render()
	},
	
	setPostsPerPage: function (count)
	{
		this.postsPerPage = count
	}
}

Papa.View = Me

})();
