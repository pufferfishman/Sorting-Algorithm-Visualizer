let list;
let settings = {
   n: 64,
   readDelay: 5,
   writeDelay: 5,
   shuffle: "fisher-yates",
   sort: "bubble"
}
let stopSort;

reset(true);

function reset(firstTime) {
   let tempList = [];
   for (let i = 1; i <= settings.n; i++) {tempList.push(i);}
   list = tempList;

   if (firstTime) {
      stopSort = false;
   } else {
      stopSort = true;
   }
   
   render();
}

function shuffle() {
   switch (settings.shuffle) {
      case "fisher-yates":
         for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
         }
   }

   render();
}
function render(options = {}) {
   let sav = document.getElementById("sav");
   sav.innerHTML = "";
   const {readIndices, writeIndices, checked, clear} = options;
   for (let i = 0; i < list.length; i++) {
      var bar = document.createElement("div");

      bar.classList.add("bar");
      bar.style.height = map(list[i], 0, list.length, 0, 100) + "%";
      bar.style.width = 100 / list.length + "%";

      if (writeIndices && writeIndices.includes(i)) {
         bar.style.backgroundColor = "var(--red)";
      } else if (readIndices && readIndices.includes(i)) {
         bar.style.backgroundColor = "var(--yellow)";
      } else if (checked >= i) {
         bar.style.backgroundColor = "var(--green)";
      } else {
         bar.style.backgroundColor = "var(--white)";
      }

      sav.appendChild(bar);
   }
}

function sort() {
   let steps = window[settings.sort + "Sort"]([...list]);
   console.log(steps);

   function animate() {
      if (steps.length === 0) {
         let k = 0;
         function completionCheck() {
            render(undefined, k);
            k++;
            if (k < list.length) {
               setTimeout(completionCheck, 500 / settings.n);
            } else {
               setTimeout(render, 250, {clear: true});
            }
         }
         completionCheck();
         render();
         return;
      }

      if (stopSort) {
         stopSort = false;
         return;
      }

      let step = steps.shift();
      let delay;

      if (step.type === "read") {
         render({readIndices: step.indices});
         delay = settings.readDelay;
      } else if (step.type === "write") {
         let [i, j] = step.indices;
         [list[i], list[j]] = [list[j], list[i]];
         render({writeIndices: step.indices});
         delay = settings.writeDelay;
      }

      setTimeout(animate, delay);
   }
   animate();
}

function map(value, low1, high1, low2, high2) {return low2 + (high2 - low2) * (value - low1) / (high1 - low1);}

document.getElementById("bars").addEventListener("input", (e) => {
   settings.n = e.target.value;
   reset()
   render();
});




// SORTING ALGORITHMS

function bubbleSort(list) {
   let steps = [];
   let swapped = true;
   let n = list.length;

   while (swapped) { // keep looping until no swaps have been made
      swapped = false;
      for (let i = 0; i < n; i++) { // loop over each element in the list
         if (list[i] > list[i + 1]) { // if the current element is greater than the next element
            
            [list[i], list[i + 1]] = [list[i + 1], list[i]]; // swap the current element and the next element
            steps.push({type: "write", indices: [i, i + 1]});
            swapped = true; // a swap has been made, so continue looping
         }
         steps.push({type: "read", indices: [i, i + 1]});
      }
   }

   return steps;
}

/*function cocktailSort(list) {
   let swapsList = [];
   var swapped = true;
   let n = list.length;

   while (swapped) {
      swapped = false;
      for (let i = 0; i < n; i++) {
         if (list[i - 1] > list[i]) {
            swapsList.push([i - 1, i]);
            swapped = true;
            [list[i - 1], list[i]] = [list[i], list[i - 1]];
         }
      }
   }

   return swapsList;
}*/

function selectionSort(list) {
   let steps = [];
   let swapped = true;
   let n = list.length;

   for (let i = 0; i < n; i++) { // loop over each element in the list
      let smallest = i;
      for (let j = i + 1; j < n; j++) { // compare i with each unsorted element in the list
         if (list[j] < list[smallest]) {smallest = j} // is this the smallest element yet
         steps.push({type: "read", indices: [smallest, j]});
      }

      [list[i], list[smallest]] = [list[smallest], list[i]];
      steps.push({type: "write", indices: [i, smallest]});
   }

   return steps;
}