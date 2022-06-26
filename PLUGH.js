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

if(typeof process != "undefined" && typeof require != "undefined") { exports.plugh = PLUGH; }function CommandLine() {

	//Part 1: The DOM
	
	this.template = `
		<div id = 'game-container'>
			<div id = 'console-container'>
			
                <div id = 'buffer'></div>
                 
				<input type = 'text' id = 'console-input' autofocus> <span>&gt;</span>

				<button id="scrolldown-indicator" onclick = "GAME_ENGINE_INSTANCE.commandLine.scrollBuffer(true);">⮛</button>
			</div> 
		</div>
	`;

	this.generation = 0;

	this.transcript = [];
	this.addToTranscript = function(i,o) { this.transcript.push({"i":i,"o":o}); }
	
	
	this.addToPage = function(qs="body") {
		
		let hd = document.createElement("div");
		hd.innerHTML = this.template;
		
		document.querySelector(qs).appendChild(hd.children[0]);

		this.consoleInput = document.querySelector("#console-input");
		this.consoleOutput = document.querySelector("#buffer");
		this.scrollIndicator = document.querySelector("#scrolldown-indicator");
		
		this.addEventListeners();
	}

	this.addEventListeners = function() {
		
		var th = this;

		this.consoleInput.addEventListener("keydown",ev=>{

			let status = GAME_ENGINE_INSTANCE.inputDelegator.getStatus();
			
			let ibs = ev.key == "Backspace" || ev.key.indexOf("Arrow") != -1;

			if(status == "enter_continues" && !ibs) { ev.preventDefault(); }
			if(status == "show_choice" && (Number.isNaN(Number.parseInt(ev.key))) && !ibs) { ev.preventDefault(); }
			
			//Enter
			if(ev.keyCode == 13) {
				this.pressEnter();
				this.queryTicker++;
			}
			
			//Up
			if(ev.keyCode == 38 && status != "enter_continues") {
				if(this.queryTicker > 0) {  
					this.queryTicker--;
					th.consoleInput.value = this.queryHistory[this.queryTicker];
				}
			}
			
			//Down
			if(ev.keyCode == 40 && status != "enter_continues") {
				if(this.queryTicker < this.queryHistory.length - 1) {
					this.queryTicker++;
					th.consoleInput.value = this.queryHistory[this.queryTicker];
				}
			}
		});
		
		this.pageResize();
		
		window.addEventListener("resize", this.pageResize);

		this.consoleOutput.addEventListener("scroll",function(ev) {
			let th = ev.target;
			let si = GAME_ENGINE_INSTANCE.commandLine.scrollIndicator;
			console.log(th.scrollTop+th.offsetHeight,th.scrollHeight);
			if(th.scrollTop+th.offsetHeight < th.scrollHeight-10) { si.style.opacity = 1; si.style.pointerEvents = 'all'; }
			else {si.style.opacity = 0; si.style.pointerEvents = "none"; }
		});
	}
	
	this.write = function(val) { this.consoleOutput.innerHTML += val; }
	this.writeLn = function(val) { this.consoleOutput.innerHTML += "<p data-generation='"+this.generation+"'>" + val + "</p><br/>"; }
	this.in = function(filter=false) { let f =  filter ? this.consoleInput.value.replace(/[^\w ]/,'') : this.consoleInput.value; this.consoleInput.value = ""; return f;}
	
	this.pageResize = function() {
	
		var newFontSize = Math.sqrt(document.body.clientWidth*(20/1280) * document.body.clientHeight*(20/720)); 
		newFontSize = Math.min(18,Math.max(14,newFontSize)) + "px"
		
		document.body.style["font-size"] = newFontSize;

		let th = GAME_ENGINE_INSTANCE.commandLine;
		th.consoleInput.style["font-size"] = newFontSize;
		th.consoleInput.focus();
	}
	
	
	this.toggleInputDisabled = function(manualDisabledValue="toggle") {
		
		if(manualDisabledValue == "toggle") { this.consoleInput.classList.toggle('no-input'); }
		else {
			
			this.consoleInput.classList[manualDisabledValue ? "add" : "remove"]("no-input") ;
		}
			
		this.consoleInput.focus();
	}

	//Part 2: IO

	this.queryHistory = [""];
	
	this.queryTicker = 0;

	this.echo = function(...e) {
		//console.log(e);
		if(typeof e != "undefined") {

			if(Array.isArray(e[0])) { e = e[0]; }

			e.forEach(el=>{
				el = el.replace("\n", "<br/>");
				
				this.writeLn(el);
				this.addToTranscript("", el + "<br/><br/>");
				this.scrollBuffer();
			});
		}
	}

	this.cls = function() {
		this.consoleOutput.innerHTML = "";
	}
	
	this.scrollBuffer = function(forceBottom) {

		
		let cgeneration = document.querySelector('[data-generation="'+this.generation+'"]');
		this.consoleOutput.scrollTo({top: cgeneration&&!forceBottom?cgeneration.offsetTop:this.consoleOutput.scrollHeight,behavior:'smooth'});
	}
	
	this.pressEnter = function() {

		this.generation++;
		
		if(this.consoleInput.classList.contains('no-input')) { return; }

		//Sanitize user input
		let eval = this.in(true);

		//Print the user input to the line
		this.echo("> " + eval);
		
		this.toggleInputDisabled(true);
		
		//Store evaluated text
		//let parsed = this.input(eval);
		let parsed = GAME_ENGINE_INSTANCE.inputDelegator.delegate(eval);

		//Set previous query
		this.queryHistory.push(eval);
		
		//Add input to save file--remember
		//though, the save file doesn't mean
		//anything unless the user actually enters
		//'save.'
		
		//If the response to the input isn't blank, print it to the buffer
		if(parsed != "" && parsed != undefined) { this.echo(parsed); }
		
		this.scrollBuffer()
		
		this.toggleInputDisabled(false);
		
		//And focus on it
		this.consoleInput.focus();

		this.transcript.push(eval, parsed);
		
	}

	this.enterContinues = function(callback = -1) {

		this.writeLn("PRESS ENTER TO CONTINUE");
		GAME_ENGINE_INSTANCE.inputDelegator.setStatus("enter_continues");
		GAME_ENGINE_INSTANCE.inputDelegator.queuedAction = callback;
	}

	this.showChoice = function(choices = []) {

		if(!Array.isArray(choices) && typeof choices == "object") {

			let newChoices = [];
			for(let key in choices) {
				newChoices.push([key,choices[key]]);
			}
			choices = newChoices;
		}

		if(Array.isArray(choices)) {
			var choicesText = "Choices: <br/>  " + choices.map((el,i)=>{
				
				if(Array.isArray(el) && el.length > 0) {
					return "<span class = 'nbsp'></span>" + (i+1) + ". " + el[0];
				}
			}).join("<br/>");
		}

		this.writeLn(choicesText);

		GAME_ENGINE_INSTANCE.inputDelegator.setStatus("show_choice");
		GAME_ENGINE_INSTANCE.inputDelegator.choicesText = choicesText;
		GAME_ENGINE_INSTANCE.inputDelegator.choices = choices;
	}

	this.yesOrNo = function(yes,no,askSecretly=false) {

		this.writeLn("(Y/N)");

		GAME_ENGINE_INSTANCE.inputDelegator.setStatus("y_or_n" + (askSecretly ? "_noprompt":""));
		GAME_ENGINE_INSTANCE.inputDelegator.choices = {"y": yes, "n": no};
	}

	this.askPassword = function(callbackCorrect, callbackIncorrect) {

		GAME_ENGINE_INSTANCE.inputDelegator.setStatus("password");
		GAME_ENGINE_INSTANCE.inputDelegator.choices = {"correct": callbackCorrect, "incorrect": callbackIncorrect};
	}

	this.node_readLine = -1;

	this.nodeLoop = function() {

		if(this.node_readLine === -1) {
			this.node_readLine = require('readline').createInterface({
				input: process.stdin,
				output: process.stdout,
			});
		}
		
		this.node_readLine.question(`What's your name?`, name => {
			GAME_ENGINE_INSTANCE.inputDelegator.delegate(name)
		});
		  
	}
	
	//this.input = preParse;

	return this;
}function DungeonParser() {

	this.lookAroundPhrases = [
		"look around",
		"search",
		"search room",
		"look",
		"desc",
		"intro",
		"description"
	];

	//We got a verb but no object last time
	this.hangingVerb = -1;

	//Remember our last referenced object so we can reference it as 'it'
	this.lastObjectReferenced = -1;

	this.parse = function(input) {

		let found = function(val) { return val != -1; }

		let currentRoom = GAME_ENGINE_INSTANCE.getCurrentRoom();
		let objectsInRoom = currentRoom.objects.concat(GAME_ENGINE_INSTANCE.player.inventory.items);

		objectsInRoom = objectsInRoom.filter(el=>{ return el.activated(); });

		let verbFound = -1;
		let objectFound = -1;

		let rawVerbFound = -1;

		let specialResponse = -1;

		input = input.toLowerCase().trim().replace(" the "," ");

		let rawInput = input.toString();

		if(input.indexOf("and then") != -1) { 
			let allCommands = input.split("and then"); 
			allCommands.forEach(el=>{
				GAME_ENGINE_INSTANCE.echo("> " + el);
				this.parse(el);
			});
			return "";
		}

		if(this.lookAroundPhrases.indexOf(input) != -1) { return this.lookAround(currentRoom); }

		if(input == "leave" && GAME_ENGINE_INSTANCE.getCurrentRoom().leave !== -1) { return GAME_ENGINE_INSTANCE.setCurrentRoom(GAME_ENGINE_INSTANCE.getCurrentRoom().leave); }
		
		if(["north","south","east","west","n","s","e","w"].indexOf(input) !== -1) { 
			let goDir = this.processCardinalDirection(input, objectsInRoom); 
			//console.log(goDir);
			if(typeof goDir == "function") { return goDir(); }
			if(typeof goDir == "string") { return goDir; } 
		}

		input = input.split(" ");

		for(let i = 0; i < input.length; i++) {

			//Find the predicate
			for(let parentVerb in this.actionWords) {

				for(let vi = 0; vi < this.actionWords[parentVerb].length; vi++) {

					let thisVerb = this.actionWords[parentVerb][vi];

					if(input[i] == thisVerb) { 
						verbFound = parentVerb; 
						rawVerbFound = thisVerb;
						break; 
					}
				}

				if(verbFound !== -1) { break; }
			}

			//Find the subject
			for(let o = 0; o < objectsInRoom.length; o++) {

				let obj = objectsInRoom[o];
				
				let objectIdentifiers = [obj.name];

				if(typeof obj.aliases != 'undefined') { objectIdentifiers = objectIdentifiers.concat(obj.aliases); }

				for(let s = 0; s < objectIdentifiers.length; s++) {

					//console.log(input[i], objectIdentifiers[s]);
					if(input[i] == objectIdentifiers[s].toLowerCase()) { 
						objectFound = objectsInRoom[o]; 
						this.lastObjectReferenced = objectFound;

						break;
					}
				}

				for(let s in obj.specialResponses) {

					let stlr = s.toLowerCase();
					if(rawInput.toLowerCase() == stlr) {

						return typeof obj.specialResponses[s] == "function" ? obj.specialResponses[s]() : obj.specialResponses[s]; 
					}
				}

				if(objectFound !== -1) { break; }
			}
		}


		//Begin Roundup

		//In the event that the user hasn't brought up a new object but they have said 'it'
		if(!found(objectFound) && found(input.indexOf("it")) && found(this.lastObjectReferenced)) {

			//Check to see if the last object they referenced is in this room
			if(found(currentRoom.getObject(this.lastObjectReferenced.id))) {

				//If it is, treat it as the object they're referencing
				objectFound = this.lastObjectReferenced;
			}
		}



		//No verb was found this parse, but a hanging verb remains from last parse
		if(!found(verbFound) && found(this.hangingVerb)) { verbFound = this.hangingVerb; this.hangingVerb = -1; }


		//Verb and object both found! Party!
		if(found(verbFound) && found(objectFound)) {
			console.log('yes',objectFound,verbFound);
			return objectFound.response(verbFound);
		}

		//Object  found, verb  notfound
		else if(found(objectFound) && !found(verbFound)) {

			if(typeof objectFound.sight != "undefined" && objectFound.sight != "") { return objectFound.response("sight"); }
			else { return this.errorText(); }
		}
		
		//Verb 
		else if(found(verbFound) && found(rawVerbFound)) {

			this.hangingVerb = verbFound;

			rawVerbFound = rawVerbFound == "x" ? "examine" : rawVerbFound;

			return "What would you like to " + rawVerbFound + "?";
		}
		else {
			return this.errorText();
		}

	}

	this.errorText = function() {
		return GAME_ENGINE_INSTANCE.customFailureMessages.length > 0 ? GAME_ENGINE_INSTANCE.customFailureMessages[Math.floor(Math.random() * GAME_ENGINE_INSTANCE.customFailureMessages.length)] : "I didn't understand that.";

	}

	this.pickUp = function() {

	}

	this.lookAround = function(currentRoom) {

		let objectsInRoom = currentRoom.objects;

		let lookAroundList = objectsInRoom.filter(el=>{
			return typeof el.pName != "undefined" && el.pName != "" && el.activated();
		}).map(el=>{
			return typeof el.pName == "function" ? el.pName() : el.pName;
		});

		let aAnAndList = [];

		lookAroundList.forEach((el,i)=>{

			let topic = " ";

			if(i == lookAroundList.length - 1 && lookAroundList.length !== 1) { topic += "and " }

			topic += (el.split(" ")[0] != "something" ? (["a","e","i","o","u","y"].indexOf(el[0]) !== -1 ? "an " : "a ") : "") + el;

			//Note we populate this list in reverse and flip it at the end, because you can push an element to the end of an array but not prepend it.
			aAnAndList.push(topic); 

		});

		//If the return value or property desc is undefined null or empty, return empty string.

		let descOrDescr = typeof currentRoom.description != "undefined" ? "description" : "desc";

		let descVal = (typeof currentRoom[descOrDescr] == "function" ? currentRoom[descOrDescr]() : currentRoom[descOrDescr]) || "";

		return (descVal?descVal+"<br/><br/>":"") + "<span class = 'lookAroundText'> There's " + aAnAndList.join(", ") + ".</span>";
	}
	
	this.actionWords = {
		"touch": [
			"touch",
			"feel",
			"rub",
			"hold",
			"poke"
		],
		"taste": [
			"taste",
			"lick",
			"mouth",
			"drink",
			"eat"
		],
		"sight": [
			"sight",
			"view",
			"look",
			"inspect",
			"examine",
			"check",
			"peek",
			"x"
		],
		"pee":[
			"pee",
			"urinate",
			"piss"
		],
		"sleep": [
			"sleep"
		],
		"smell": [
			"smell",
			"waft",
			"nose"
		],
		"hear": [
			"hear",
			"listen"
		],
		"read": [
			"read"
		],
		"attack": [
			"attack",
			"punch",
			"kick",
			"kill",
			"fight",
			"beat",
			"stab",
			"barrage",
			"prod",
			"smash",
			"break",
			"cut"
		],
		"shoot":[
			"shoot",
			"blast"
		],
		"talk": [
			"talk",
			"speak",
			"mention",
			"tell",
			"say",
			"hello",
			"hi",
			"yell"
		],
		"sex": [
			"sex",
			"teabag",
			"fuck",
			"sex",
			"oral sex",
			"fellate",
			"orgasm",
			"cum",
			"masturbate",
			"skeet",
			"rape",
			"love"
		],
		"smoke":[
			"smoke"
		],
		"use": [
			"use",
			"activate",
			"enable",
			"turn on",
			"press"
		],
		"open": [
			"open"
		],
		"enter": [
			"enter",
			"go",
			"cross",
			"walk",
			"run",
			"travel",
			"jump",
			"swim",
			"follow"
		],
		"take": [
			"take",
			"steal",
			"pick",
			"harvest",
			"get",
			"grab",
			"capture"
		],
		"UNUSED": [
			"UNUSED"
		],
		"turn": [
			"turn",
			"flip",
			"reverse"
		],
		"give": [
			"give",
			"pass",
			"hand",
			"feed"
		],
		"drop": [
			"drop"
		],
		"move": [
			"move",
			"push",
			"pull"
		],
		"search": [
			"search",
			"search"
		],
		"close": [
			"close",
			"seal",
			"tighten"
		],
		"fill": [
			"fill"
		],
		"cast": [
			"cast"
		],
		"light": [
			"light",
			"ignite",
			"combust",
			"burn"
		],
		"toss": [
			"toss",
			"throw"
		],
		"knock": [
			"knock"
		],
		"turnoff":[
			"off",
			"disable"
		],
		"extinguish":[
			"extinguish"
		]
	}

	this.processCardinalDirection = function(val, objectsInRoom) {

		val = val == 'n' ? 'north' : (val == 's' ? 'south' : (val == 'e' ? 'east' : (val == 'w' ? 'west' : '')));

		for(let i = 0; i < objectsInRoom.length; i++) {

			let aliases = Array.isArray(objectsInRoom[i].aliases) ? objectsInRoom[i].aliases : [];

			if(objectsInRoom[i].name == val || aliases.indexOf(val) !== -1) {

				return objectsInRoom[i].enter;
			}
		}

		return "You can't go that way.";
	}


	return this;
}function InputDelegator(input="", status) {

	this.dungeonParser = new DungeonParser();

	this.queuedAction = -1;
	this.lastQueuedActionString = -1;

	this.choices = [];
	this.choicesText = [];

	this.statuses = [
		"dungeon_navigation",
		"enter_continues",
		"show_choice",
		"y_or_n",
		"y_or_n_noprompt",
		"password",
		"dload"
	];

	this.status = 0;

	this.setStatus = function(val=0) {
		if(typeof val === "string") {
			if(this.statuses.indexOf(val) !== -1) { this.status = this.statuses.indexOf(val); }
		}
		else {
			this.status = 0;
		}

		return this.status;
	}

	this.getStatus = function(string=true) { return string ? this.statuses[this.status] : this.status; }

	//This is what happens when the user presses enter, as sent from CommandLine.js
	this.delegate = function(input) {

		let returnVal = "";

		if(GAME_ENGINE_INSTANCE.settings.debug_mode && input == "dload") { this.setStatus("dload"); return "Where to?"; }

		if(this.getStatus() == "dungeon_navigation") { returnVal = this.dungeonParser.parse(input); }
		else if(this.getStatus() == "enter_continues") { 

			this.setStatus("dungeon_navigation");

			//console.log(this.getStatus(),this.queuedAction);

			if(this.queuedAction !== -1) {

				console.log(this.queuedAction, this.lastQueuedActionString);

				if(typeof this.queuedAction == "function" && (this.queuedAction.toString() !== this.lastQueuedActionString)) {

					this.lastQueuedActionString = this.queuedAction.toString();
					returnVal = this.queuedAction();
				}

				if(returnVal == "") {

					this.queuedAction = -1;
					this.lastQueuedActionString = -1;
					returnVal = this.delegate(input);
				}

			}

		}
		else if(this.getStatus() == "show_choice") {

			this.lastQueuedActionString = -1;

			let numberChoice = Number.parseInt(input);

			if((numberChoice <= this.choices.length && numberChoice > 0) && typeof this.choices[numberChoice-1] != "undefined"){

				this.setStatus("dungeon_navigation");
				returnVal = this.choices[numberChoice-1][1]();
			}
			else {

				returnVal = this.choicesText;
			}
		}
		else if(this.getStatus() == "y_or_n" || this.getStatus() == "y_or_n_noprompt") {

			let ilc = typeof input[0] != "undefined" ? input[0].toLowerCase() : "";

			if(ilc == "y" || ilc == "n") { 
				this.setStatus("dungeon_navigation"); 
				if(typeof this.choices[ilc] == "function") { returnVal = this.choices[ilc](); } 
			}
			else {

				if(this.getStatus() == "y_or_n_noprompt") { this.setStatus("dungeon_navigation"); returnVal = this.delegate(input); }
				else { returnVal = "(Y/N)"; }
			}
		}
		else if(this.getStatus() == "password") {

			let correctOrIncorrect = input == this.password ? "correct" : "incorrect";
			if(typeof this.choices[correctOrIncorrect] == "function") { returnVal = this.choices[correctOrIncorrect](); }
		}
		else if(this.getStatus() == "dload") {

			
			this.setStatus("dungeon_navigation");
			GAME_ENGINE_INSTANCE.loadRoom(input);
		}

		return returnVal;
	}


	return this;
}function Room(name,pname,props) {
	
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
	
	this.id = GAME_ENGINE_INSTANCE.generateID();

	GAME_ENGINE_INSTANCE.addRoom(this);


	return this;
}
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
}function Player() {

	this.name = "";
	this.score = 0;

	this.hp = 100;
	this.mp = 100;
	this.ap = 100;

	this.ranks = {
		0: {"rank": "F", "text": "You really need to try harder because that was garbage."}, 
		20: {"rank": "C", "text": "Good effort! You get a participation trophy."},
		50: {"rank": "B", "text": "Nicely done."},
		75: {"rank": "A", "text": "You did pretty good! Nice job!"},
		100: {"rank": "A+", "text": "WELL DONE! Getting a higher score would be a neat trick!"}
	}

	this.gameOver = function(specialMessage="GAME OVER.", showRank=false) {

		echo("<hr/>");

		GAME_ENGINE_INSTANCE.echo(specialMessage);
		GAME_ENGINE_INSTANCE.echo("SCORE: " + this.score);
		
		if(showRank) {

			let rank = -1;

			for(let i in this.ranks) {
				if(this.score >= i) { rank = this.ranks[i]; }
			}

			GAME_ENGINE_INSTANCE.echo("RANK: " + rank.rank + "<br/>" + rank.text);
		}

		GAME_ENGINE_INSTANCE.echo("Play again?");

		GAME_ENGINE_INSTANCE.yesOrNo(
			function(){
				location.reload();
			},
			function(){
				GAME_ENGINE_INSTANCE.echo("Goodbye then.");
				document.body.style.opacity = 0;
		});
	}

	this.inventory = {
		"items":[],
		"getItem":function(val) {

			if(typeof val == "object") { val = val.id; }

			for(let i = 0; i < this.items.length; i++) {

				if(this.items[i][typeof val == "string" ? "name" : "id"] == val) {
					return this.items[i];
				}
			}

			return false;
		},
		"addItem": function(val) {

			if(!this.getItem(val)) {
				return this.items.push(GAME_ENGINE_INSTANCE.getObject(val));
			}
			else {return false;}
		},
		"removeItem": function(val) {
			
			let itf = this.getItem(val);
			let oldInv = this.items.length;

			this.items = this.items.filter(el=>{ return el.id != itf.id; });

			if(oldInv != this.items.length) { return true; }
			else { return false; }
		}
	}
}