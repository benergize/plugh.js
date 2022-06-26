function CommandLine() {

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
}