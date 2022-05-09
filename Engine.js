/*Handle:
	Object registry
	Room registry
	Room retrieval/addition, global object registration

*/
function Plugh(domElement="body") {

	GAME_ENGINE_INSTANCE = this;
	_GAME_ENGINE_INSTANCE = this;

	this.domElement = document.querySelector(domElement);
	this.commandLine = new CommandLine();
	this.inputDelegator = new InputDelegator();
	this.player = new Player();

	this.customFailureMessages = [];

	this.init = function() {
		this.commandLine.addToPage(domElement);

		this.echo = function(output) { GAME_ENGINE_INSTANCE.commandLine.echo(output); }
		this.enterContinues = function(callback) { GAME_ENGINE_INSTANCE.commandLine.enterContinues(callback); }
		this.showChoice = function(choices) { GAME_ENGINE_INSTANCE.commandLine.showChoice(choices); }
		this.yesOrNo = function(yes,no) { GAME_ENGINE_INSTANCE.commandLine.yesOrNo(yes,no); }
		window.echo = this.echo;
	}


	this.rooms = [];
	this.objects = [];
	this.media = [];

	this.currentRoom = 0;

	this.highestID = 0;

	this.isset = function(val) { return typeof val != 'undefined'; }

	this.addRoom = function(room) {

		if(!this.isset(room.id)) { room.id = this.generateID(); }

		this.rooms.push(room);

		return room;
	}

	this.getRoom = function(val) {
		if(typeof val == "object") { return val; }
		else {
			for(let v = 0; v < this.rooms.length; v++) {
				if(this.rooms[v][typeof val == "string" ? "name" : "id"] == val) { return this.rooms[v]; }
			}
		}
		return -1;
	}

	this.getCurrentRoom = function() {
		return this.getRoom(this.currentRoom);
	}

	this.setCurrentRoom = function(room) {
		let nextRoom = this.getRoom(room);

		if(nextRoom !== -1) { 
			this.currentRoom = this.getRoom(room); 
			if(typeof this.currentRoom.intro == "function") { this.currentRoom.intro(); }
			else { echo(this.currentRoom.intro); }
		}
		else { return false; }
	}
	this.loadRoom = this.setCurrentRoom;
	
	this.addObject = function(obj) {

		if(!this.isset(obj.id)) { obj.id = this.generateID(); }

		this.objects.push(obj);

		return obj;
	}

	this.getObject = function(val, room = -1) {
		if(typeof val == "object") { return val; }
		else {

			let searchIn = this.objects;
			if(room !== -1) {
				searchIn = this.getRoom(room).objects;
			}

			for(let v = 0; v < searchIn.length; v++) {
				if(searchIn[v][typeof val == "string" ? "name" : "id"] == val) { return searchIn[v]; }
			}
		}
		return -1;
	}


	this._flags = {}
	
	this.gameState = function(attr,set=null) {
		if(set!==null) { this['_flags'][attr]=set; }
		else {
			return typeof this['_flags'][attr] != 'undefined' && this['_flags'][attr] !== false;
		}
	}
	this.generateID = function() {  
		this.highestID++;
		return this.highestID;
	}

	return this;
}