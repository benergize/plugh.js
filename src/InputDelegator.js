function InputDelegator(input="", status) {

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
}