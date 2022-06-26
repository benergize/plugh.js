function GameObject(name,pname,props) {
	
	let propsInit = {
		'name':name,
		'pName':pname,
		'active':true,

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
		"turnoff":"",
		"sleep":"",
		
		'specialResponses':{}
	}
	
	for(let v in propsInit) { this[v] = propsInit[v]; }
	for(let v in props) { this[v] = props[v]; }

	this.activate = function() { this.active = true; }
	this.deactivate = function() { this.active = false; }
	this.activated = function() { return typeof this.active == "boolean" ? this.active : (typeof this.active == "function" ? this.active() : true); }
	this.getActivated = this.activated;

	this.response = function(property) {
		return typeof this[property] == "function" ? this[property]() : (typeof this[property] != "undefined"&&this[property]!=="" ? this[property] : "Undefined response.");
	}



	this.id = GAME_ENGINE_INSTANCE.generateID();

	GAME_ENGINE_INSTANCE.addObject(this);

	return this;
}