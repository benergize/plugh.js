function Player() {

	this.name = "";
	this.score = 0;

	this.hp = 100;
	this.mp = 100;
	this.ap = 100;

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