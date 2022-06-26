function Player() {

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