;(function () {

var myName = 'Cascade'

function indexOf (a, v, i)
{
	var len = a.length,
		i = +i || 0
	i = (i < 0) ? (Math.ceil(i) + len) : Math.floor(i)

	for (; i < len; i++)
		if (i in a && a[i] === v)
			return i
	return -1
}

function Me (job)
{
	this.timers = {}
	this.children = []
	if (job)
		this.job = job
	this.state = 'ready'
	this.constructor = Me
}

Me.running = 0

Me.prototype =
{
	state: 'undefined',
	jobCompleted: false,
	parallel: Infinity,
	spawnable: true,
	holder: null,
	oncomplete: function () {},
	onbeforecomplete: function () {},
	
	doJob: function ()
	{
		// passing “this” as a parameter is handy in tangled closures
		this.job(this)
		this.jobCompleted = true
		
		// children may have been added in job
		this.spawn()
		// or it may become nothing to do
		this.checkCompleteness()
	},
	
	add: function (job)
	{
		if (this.state != 'ready' && this.state != 'running')
			throw new Error('can not add children while "' + this.state + '" state')
		
		var children = this.children
		
		if (typeof job === 'function')
		{
			job = new Me(job)
			job.holder = this.holder
		}
		else
			if (indexOf(children, job) >= 0)
				return null
		
		job.parent = this
		children.push(job)
		return job
	},
	
	sigchild: function (child)
	{
		if (this.state != 'running')
			return // throw new Error('sigchild() while "' + this.state + '" state from ' + child.name)
		
		this.spawn()
		this.checkCompleteness()
	},
	
	checkCompleteness: function ()
	{
		// our own job is not done yet
		if (!this.jobCompleted)
			return
		
		// check all children (even not spawnable) for completeness
		var children = this.children
		for (var i = 0; i < children.length; i++)
			if (children[i].state != 'completed')
				return
		
		// no new children may have been added here
		this.onbeforecomplete()
		
		// finaly complete ourselfs
		this.completed()
	},
	
	completed: function ()
	{
		this.state = 'completed'
		Me.running--
		
		this.oncomplete()
		
		if (this.parent)
			this.parent.sigchild(this)
	},
	
	spawn: function ()
	{
		var ready = [], running = 0
		
		var children = this.children
		for (var i = 0; i < children.length; i++)
		{
			var child = children[i]
			
			// some children can be started by hand
			if (!child.spawnable)
				continue
			
			// collect ready children
			if (child.state == 'ready')
				ready.push(child)
			// count currently running
			else if (child.state == 'running')
				running++
		}
		
		// simply spawn as many children as needed by “this.parallel”
		var spawn = this.parallel - running
		for (var i = 0, il = ready.length; i < il && i < spawn; i++)
			ready[i].start()
	},
	
	start: function (delay)
	{
		if (this.state != 'ready')
			return
		
		this.state = 'running'
		Me.running++
		
		var me = this
		this.timer('job', function () { me.doJob() }, delay)
	},
	
	stop: function ()
	{
		if (this.state == 'completed')
			return
		
		// mark job as completed
		this.jobCompleted = true
		
		// stop all planned callbacks
		this.timersClear()
		
		// check ourselfs for completeness
		this.checkCompleteness()
		
		// otherwise stop() all children and wait for sigchild()
		var children = this.children
		for (var i = 0; i < children.length; i++)
			children[i].stop()
	},
	
	timer: function (name, func, delay)
	{
		var timers = this.timers, holder = this.holder
		if (timers[name])
			holder.clearTimeout(timers[name])
		
		return timers[name] = holder.setTimeout(func, delay || 0)
	},
	
	timersClear: function ()
	{
		var timers = this.timers, holder = this.holder
		for (var k in timers)
		{
			holder.clearTimeout(timers[k])
			delete timers[k]
		}
	}
}

Me.className = myName
self[myName] = Me

})();