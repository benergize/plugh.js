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

		let found = function(val) { return val !== -1; }

		let currentRoom = GAME_ENGINE_INSTANCE.getCurrentRoom();
		let objectsInRoom = currentRoom.objects.concat(GAME_ENGINE_INSTANCE.player.inventory.items);

		let verbFound = -1;
		let objectFound = -1;

		let rawVerbFound = -1;

		input = input.toLowerCase().trim().replace(" the "," ");

		let specialResponse = -1;
		let specialResponseType = [
			"lookAround",
			"cardinalDirection",
			"magicWord"
		];

		if(this.lookAroundPhrases.indexOf(input) != -1) { return this.lookAround(currentRoom); }
		if(input.indexOf("pick up") != -1) {  }

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

					console.log(input[i], objectIdentifiers[s]);
					if(input[i] == objectIdentifiers[s].toLowerCase()) { 
						objectFound = objectsInRoom[o]; 
						this.lastObjectReferenced = objectFound;

						break;
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
		if(!found(verbFound) && found(this.hangingVerb)) { this.verbFound = this.hangingVerb; this.hangingVerb = -1; }


		//Verb and object both found! Party!
		if(found(verbFound) && found(objectFound)) {
			
			return objectFound.response(verbFound);
		}

		//Object  found, verb  notfound
		else if(found(objectFound) && !found(verbFound)) {

			if(typeof objectFound.sight != "undefined" && objectFound.sight != "") { return objectFound.response("sight"); }
		}
		
		//Verb 
		else if(found(verbFound)) {

			this.hangingVerb = verbFound;

			return "What would you like to " + rawVerbFound + "?";
		}
		else {

			return GAME_ENGINE_INSTANCE.customFailureMessages.length > 0 ? GAME_ENGINE_INSTANCE.customFailureMessages[Math.floor(Math.random() * GAME_ENGINE_INSTANCE.customFailureMessages.length)] : "I didn't understand that.";
		}

	}

	this.pickUp = function() {

	}

	this.lookAround = function(currentRoom) {

		let objectsInRoom = currentRoom.objects;

		let lookAroundList = objectsInRoom.filter(el=>{return typeof el.pName != "undefined" && el.pName != "";}).map(el=>{return el.pName;});

		let aAnAndList = [];

		lookAroundList.forEach((el,i)=>{

			let topic = " ";

			if(i == lookAroundList.length - 1 && lookAroundList.length !== 1) { topic += "and " }

			topic += (el.split(" ")[0] != "something" ? (["a","e","i","o","u","y"].indexOf(el[0]) !== -1 ? "an " : "a ") : "") + el;

			//Note we populate this list in reverse and flip it at the end, because you can push an element to the end of an array but not prepend it.
			aAnAndList.push(topic); 

		});

		//If the return value or property desc is undefined null or empty, return empty string.
		let descVal = (typeof currentRoom.desc == "function" ? currentRoom.desc() : currentRoom.desc) || "";

		return descVal + "<br/><br/>There's " + aAnAndList.join(", ") + ".";
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
			"peek"
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
			"break"
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
		]
	}


	return this;
}