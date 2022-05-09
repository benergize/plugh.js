function GameObject(name,pname,props) {
	
	let propsInit = {
		'name':name,
		'pName':pname,
		'touch':"",
		'taste':"",
		'sight':"",
		'smell':"",
		'hear':"",
		'read':"",
		'attack':"",
		'talk':"",
		'sex':"",
		'use':"",
		'open':"",
		'enter':"",
		'take':"",
		'turn':"",
		'give':"",
		'drop':"",
		'move':"",
		'search':"",
		'close':"",
		'fill':"",
		'cast':"",
		'light':"",
		'toss':'',
		
	}
	
	for(let v in propsInit) { this[v] = propsInit[v]; }
	for(let v in props) { this[v] = props[v]; }

	this.disabled = false;
	this.enable = function() { this.disabled = false; }
	this.disable = function() { this.disabled = true; }
	this.enabled = function() { return !this.disabled; }

	this.response = function(property) {
		return typeof this[property] == "function" ? this[property]() : (typeof this[property] != "undefined" ? this[property] : "Undefined response.");
	}

	this.id = GAME_ENGINE_INSTANCE.generateID();

	return this;
}