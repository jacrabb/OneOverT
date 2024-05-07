/*
  A simple UI to see how much time passes in a given clock cycle.
  Would like to add how many clock cycles at frequency are contained in some amount of time.
*/
import {conversion_app} from "/oneOverT.js";

// Update view function for left elements
const conversionApp = conversion_app();

const viewApp = {
	leftContainerBackup: null,
	rightContainerBackup: null,
	init() {
		this.leftContainerBackup = document.querySelector("#leftContainer").cloneNode(true);
		this.rightContainerBackup = document.querySelector("#rightContainer").cloneNode(true);
		//this.reset();
	},
	update(state) {
		let leftElements = [];
		let rightElements = []
		document.querySelector("#leftContainer").replaceWith(this.leftContainerBackup.cloneNode(true));
		document.querySelector("#rightContainer").replaceWith(this.rightContainerBackup.cloneNode(true));

		let leftContainer = document.querySelector("#leftContainer");
		let rightContainer = document.querySelector("#rightContainer");

		for(let i = 2; i <= conversionApp.state.domain.units.length; i++){
			leftContainer.appendChild(leftContainer.querySelector(".leftValues").cloneNode(true));
		}
		for(let i = 2; i <= conversionApp.state.otherDomain.units.length; i++){
			rightContainer.appendChild(rightContainer.querySelector(".rightValues").cloneNode(true));
		}

		let tempElements = {label:null, value:null, reset() {this.label = null; this.value = null;}, getData() {return {label:this.label, value:this.value};}};
		for (const i of leftContainer.querySelectorAll(".leftValues")) {
			for (const c of i.children) {
				//console.log(c.dataset.tag);
				if(c.dataset.tag == "label")
					tempElements["label"] = c;
				else if(c.dataset.tag == "value")
					tempElements["value"] = c;
				else
					continue;

				if(tempElements["label"] !== null && tempElements["value"] !== null){
					//leftElements.push({...tempElements}); // spread operator to shallow copy - would structuredClone() be better?
					leftElements.push(tempElements.getData());
					tempElements.reset();
				}
			}
		}
		tempElements.reset(); // just to be sure
		for (const i of rightContainer.querySelectorAll(".rightValues")) {
			for (const c of i.children) {
				//console.log(c.dataset.tag);
				if(c.dataset.tag == "label")
					tempElements["label"] = c;
				else if(c.dataset.tag == "value")
					tempElements["value"] = c;
				else
					continue;

				if(tempElements["label"] !== null && tempElements["value"] !== null){
					//leftElements.push({...tempElements}); // spread operator to shallow copy - would structuredClone() be better?
					rightElements.push(tempElements.getData());
					tempElements.reset();
				}
			}
		}
		{ let i = 0;
			for (const c of leftElements) {
				c.label.innerHTML = ( (state.error == null) ? state.calc(state.domain.units[i]) : "---" );
				c.value.innerHTML = ( state.domain[state.domain.units[i]].prettyName );
				i++;
			}
		}
		{ let i = 0;
			for (const c of rightElements) {
				c.label.innerHTML = ( (state.error == null) ? state.calc(state.otherDomain.units[i]) : "---" );
				c.value.innerHTML = ( state.otherDomain[state.otherDomain.units[i]].prettyName );
				i++;
			}
		}
	}
};

// init
document.addEventListener('DOMContentLoaded', function () {
	viewApp.init();

	// event hndlr for test button
	document.querySelector("#refreshButton").addEventListener("click", function(e) {
		e.preventDefault();
		let state = conversionApp.state.update("12hz");
		viewApp.update(state);
		//console.log(state);
	});

	// event bindings for input fields.
	document.querySelector("#leftInput").addEventListener("keyup", function() {
		viewApp.update(conversionApp.state.update(this.value));
	} );
}, false);
