
var fs = require('fs');

// file is included here:
eval(fs.readFileSync('PLUGH.js')+'');

game = new PLUGH();
console.log("hi");

game.addRoom(new Room("roo_docks", "the docks", {
	'intro': function() {
		if(!game.gameState("initial_intro")) {
			console.log("You arrive in Yarmouth on the onset of the cold season at 5 o'clock one night. No one is at the docks to greet you and your bags are nowhere in sight. The small boat that took you here has already pulled away, and, with it out of earshot, you are alone.");
			game.gameState("initial_intro",true)
		}
		else {
			console.log("You're at the lonely dock outside Yarmouth. This is the only way back to civilization, and the boat that brought you here is gone.");
		}
	},
	'desc': "You're by the docks, alone. Water splashes against the rocks uneasily. A bitter wind seaps through your jacket.",
	'gameObjects': [
		new GameObject("town_square", "dirt path up to the town", {
			"aliases": ["path", "town", "trail","village"],
			"enter": function() { game.loadRoom("roo_town_square") }
		}),
		new GameObject("water", "", {
			"sight": function() {
				console.log(
					!game.gameState("has_been_to_village") ? 
						"The water stretches forever out to the horizon. The boat that brought you here is far in the distance, on the verge of disappearing. It's now out of earshot." :
						"The water stretches forever out to the horizon. The boat that brought you here has disappeared from site. You are alone."
				);
			},
			"swim": "The water is freezing cold and swimming would mean certain death."
		})
	]
}));

game.setCurrentRoom("roo_docks");

game.init(true);
