function DungeonParser() {

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
}