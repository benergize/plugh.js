/*Handle:
	Object registry
	Room registry
	Room retrieval/addition, global object registration

*/
function PLUGH(domElement="body", globalize=true) {

	GAME_ENGINE_INSTANCE = this;
	_GAME_ENGINE_INSTANCE = this;

	this.globalize = globalize;

	this.settings = {

		"show_look_around_text_on_room_load": false,
		"show_room_description_on_room_load": false,
		"make_window_title_room_name": true,
		"debug_mode":true
	};

	this.name = "Text Adventure";

	this.commandLine = new CommandLine();
	this.inputDelegator = new InputDelegator();
	this.player = new Player();

	this.customFailureMessages = [];

	this.init = function(cli=false) {

		this.cls = function() { GAME_ENGINE_INSTANCE.commandLine.cls(); }
		this.echo = function(...output) { GAME_ENGINE_INSTANCE.commandLine.echo(...output); }
		this.enterContinues = function(callback) { GAME_ENGINE_INSTANCE.commandLine.enterContinues(callback); }
		this.showChoice = function(choices) { GAME_ENGINE_INSTANCE.commandLine.showChoice(choices); }
		this.yesOrNo = function(yes,no) { GAME_ENGINE_INSTANCE.commandLine.yesOrNo(yes,no); }
		this.askPassword = function(callbackCorrect, callbackIncorrect) { GAME_ENGINE_INSTANCE.commandLine.yesOrNo(callbackCorrect,callbackIncorrect); }

		if(typeof window != "undefined" && this.globalize) { 
			window.echo = this.echo; 
			window.cls = this.cls;
			window.enterContinues = this.enterContinues;
			window.showChoice = this.showChoice;
			window.yesOrNo = this.yesOrNo;
			window.askPassword = this.askPassword;

			window.gameState = function(...args) {   GAME_ENGINE_INSTANCE.gameState(...args); }
			window.gameState2 = function(...args) {   GAME_ENGINE_INSTANCE.gameState2(...args); }
			window.getObject = function(...args) {   GAME_ENGINE_INSTANCE.getObject(...args); }
			window.getRoom = function(...args) {   GAME_ENGINE_INSTANCE.getRoom(...args); }
			window.getCurrentRoom = function(...args) {   GAME_ENGINE_INSTANCE.getCurrentRoom(...args); }
			window.loadRoom = function(...args) {   GAME_ENGINE_INSTANCE.loadRoom(...args); }
			window.setCurrentRoom = function(...args) {   GAME_ENGINE_INSTANCE.setCurrentRoom(...args); }
			
		}

		if(cli && typeof require == "function" && typeof process != "undefined") {

			this.commandLine.nodeLoop();
		}
		else {

			this.domElement = document.querySelector(domElement);
			this.commandLine.addToPage(domElement);
		}
	}

	


	this.rooms = [];
	this.objects = [];
	this.media = [];

	this.currentRoom = 0;
	this.lastRoom = this.currentRoom;

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
			this.lastRoom = this.currentRoom.id;
			this.currentRoom = this.getRoom(room);

			if(this.settings.make_window_title_room_name) { 
				document.title = this.currentRoom.pName + " - " + this.name;
			}
			
			if(typeof this.currentRoom.intro == "function") { this.currentRoom.intro(); }
			else { this.echo(this.currentRoom.intro); }

			if(this.settings.show_room_description_on_room_load) {
				if(typeof this.currentRoom.description == "function") { this.currentRoom.intro(); }
				else { this.echo(this.currentRoom.description); }
			}
			if(this.settings.show_look_around_text_on_room_load) {
				this.echo(this.inputDelegator.delegate("look around"));
			}
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
		//console.log(attr,set,this)
		if(set!==null) { this['_flags'][attr]=set; }
		else {
			return this['_flags'][attr];
		}
	}

	this.gameState2 = function(attr,set=null) {
		//console.log(attr,set,this);
		if(set!==null) { this['_flags'][attr]=set; }
		else {
			return typeof this['_flags'][attr] != 'undefined' && this['_flags'][attr] !== false;
		}
	}

	this.generateID = function() {  
		this.highestID++;
		return this.highestID;
	}

	this.save = function() {

		let saveObject = {
			player: this.player,
			gameState: this._flags
		};

		this.echo(btoa(JSON.stringify(saveObject)));
	}

	return this;
}

if(typeof process != "undefined" && typeof require != "undefined") { exports.plugh = PLUGH; }