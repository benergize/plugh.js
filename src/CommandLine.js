function CommandLine() {

	//Part 1: The DOM
	
	this.template = `
		<div id = 'game-container'>
			<div id = 'console-container'>
			
                <div id = 'buffer'></div>
                 
				<input type = 'text' id = 'console-input' autofocus> <span>&gt;</span>
			</div> 
		</div>
	`;

	this.transcript = [];
	this.addToTranscript = function(i,o) { this.transcript.push({"i":i,"o":o}); }
	
	
	this.addToPage = function(qs="body") {
		
		let hd = document.createElement("div");
		hd.innerHTML = this.template;
		
		document.querySelector(qs).appendChild(hd.children[0]);

		this.consoleInput = document.querySelector("#console-input");
		this.consoleOutput = document.querySelector("#buffer");
		
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
	}
	
	this.write = function(val) { this.consoleOutput.innerHTML += val; }
	this.writeLn = function(val) { this.consoleOutput.innerHTML += val + "<br/><br/>"; }
	this.in = function(filter=false) { let f =  filter ? this.consoleInput.value.replace(/[^\w ]/,'') : this.consoleInput.value; this.consoleInput.value = ""; return f;}
	
	this.pageResize = function() {
	
		var newFontSize = Math.sqrt(document.body.clientWidth*(20/1280) * document.body.clientHeight*(20/720)); 
		newFontSize = Math.min(18,Math.max(14,newFontSize)) + "px"
		
		document.body.style["font-size"] = newFontSize;
		
		this.consoleInput.style["font-size"] = newFontSize;
		this.consoleInput.focus();
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

	this.echo = function(e) {
		console.log(e);
		if(typeof e != "undefined") {
			e.replace("\n", "<br/>");
			
			this.writeLn(e);
			this.addToTranscript("", e + "<br/><br/>");
			this.scrollBuffer();
		}
	}

	this.cls = function() {
		this.consoleOutput.innerHTML = "";
	}
	
	this.scrollBuffer = function() {
		console.log(this);
		this.consoleOutput.scrollTo({top:this.consoleOutput.scrollHeight,behavior:'smooth'});
	}
	
	this.pressEnter = function() {
		
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
		if(parsed != "" && parsed != undefined) { echo(parsed); }
		
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

		let choicesText = "Choices: <br/><br/> " + choices.map((el,i)=>{
			
			if(Array.isArray(el) && el.length > 0) {
				return " " + (i+1) + ". " + el[0];
			}
		}).join();

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
	
	//this.input = preParse;

	return this;
}