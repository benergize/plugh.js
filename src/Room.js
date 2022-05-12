function Room(name,pname,props) {
	
	let propsInit = {
		'name':name,
		'pName':pname,
		'desc':'',
		'intro':'',
		'objects': [],
		'leave':-1
	}

	
	let objects = [];
	if(Array.isArray(props.roomObjects)) { objects = objects.concat(props.roomObjects); }
	if(Array.isArray(props.gameObjects)) { objects = objects.concat(props.gameObjects); }
	if(Array.isArray(props.objects)) { objects = objects.concat(props.objects); }
	props.objects = objects;
	
	
	for(let v in propsInit) { this[v] = propsInit[v]; }
	for(let v in props) { this[v] = props[v]; }

	this.addObject = function(obj) {

		obj = GAME_ENGINE_INSTANCE.addObject(obj);
		this.objects.push(obj);

		return obj;
	}

	this.removeObject = function(obj) {

		let oldObjs = this.objects.length;
		this.objects = this.objects.filter(el=>{ return el.id != obj.id; });
		return oldObjs != this.objects.length
	}

	this.getObject = function(obj) {
		return GAME_ENGINE_INSTANCE.getObject(obj, this);
	}


	return this;
}
