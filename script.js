let list;
let settings = {
   n: 64,
   readDelay: 0,
   writeDelay: 0,
   shuffle: "fisher-yates",
   sort: "bubble"
}
let stopSort;

reset(false);

function reset(stop) {
   let tempList = [];
   for (let i = 1; i <= settings.n; i++) {tempList.push(i);}
   list = tempList;

   if (stop) {
      stopSort = true;
   } else {
      stopSort = false;
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
   let [steps, listPositions] = window[settings.sort + "Sort"]([...list]);
   let j = 0;

   function animate() {
      if (steps.length === 0) {
         let k = 0;
         function completionCheck() {
            render({checked: k});
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
         j++;
         list = listPositions[j];
         render({writeIndices: step.indices});
         delay = settings.writeDelay;
      }
      setTimeout(animate, delay);
   }
   animate();
}

function map(value, low1, high1, low2, high2) {return low2 + (high2 - low2) * (value - low1) / (high1 - low1);}

document.getElementById("n-slider").addEventListener("input", (e) => {
   settings.n = e.target.value;
   reset(false)
   render();
});

document.getElementById("algorithm-dropdown").addEventListener("change", (e) => {
   settings.sort = e.target.value;
});




// SORTING ALGORITHMS

function bubbleSort(list) {
   let n = list.length;
   let steps = [];
   let listPositions = [[...list]];
   let swapped = true;
   
   for (let i = 0; i < n - 1; i++) { // keep looping until no swaps have been made
      swapped = false;
      for (let j = 0; j < n - i - 1; j++) { // loop over each element in the list
         steps.push({type: "read", indices: [j, j + 1]});

         if (list[j] > list[j + 1]) { // if the current element is greater than the next element
            
            [list[j], list[j + 1]] = [list[j + 1], list[j]]; // swap the current element and the next element
            steps.push({type: "write", indices: [j, j + 1]});
            listPositions.push([...list]);
            swapped = true;
         }
      }

      if (!swapped) break;
   }

   return [steps, listPositions];
}

function cocktailSort(list) {
   let n = list.length;
   let steps = [];
   let listPositions = [[...list]];
   var swapped = true;
   let start = 0;
   let end = n;
   
   for (let i = 0; i < n - 1; i++) { // keep looping until no swaps have been made
      swapped = false;
      for (let j = start; j < end - 1; j++) { // loop over each element in the list
         steps.push({type: "read", indices: [j, j + 1]});

         if (list[j] > list[j + 1]) { // if the current element is greater than the next element
            
            [list[j], list[j + 1]] = [list[j + 1], list[j]]; // swap the current element and the next element
            steps.push({type: "write", indices: [j, j + 1]});
            listPositions.push([...list]);
            swapped = true;
         }
      }

      if (!swapped) break;
      end--;

      swapped = false;
      for (let j = end - 1; j >= start; j--) { // loop over each element in the list
         steps.push({type: "read", indices: [j, j + 1]});

         if (list[j] > list[j + 1]) { // if the current element is greater than the next element
            [list[j], list[j + 1]] = [list[j + 1], list[j]]; // swap the current element and the next element
            steps.push({type: "write", indices: [j, j + 1]});
            listPositions.push([...list]);
            swapped = true;
         }
      }

      start++;
   }

   return [steps, listPositions];
}

function selectionSort(list) {
   let n = list.length;
   let steps = [];
   let swapped = true;
   let listPositions = [[...list]];

   for (let i = 0; i < n; i++) { // loop over each element in the list
      let smallest = i;
      for (let j = i + 1; j < n; j++) { // compare i with each unsorted element in the list
         if (list[j] < list[smallest]) {smallest = j} // is this the smallest element yet
         steps.push({type: "read", indices: [smallest, j]});
      }

      [list[i], list[smallest]] = [list[smallest], list[i]]; // swap the current index with the smallest element
      steps.push({type: "write", indices: [i, smallest]});
      listPositions.push([...list]);
   }

   return [steps, listPositions];
}

function insertionSort(list) {
   let n = list.length;
   let steps = [];
   let listPositions = [[...list]];

   for (let i = 1; i < n; i++) { // key
      let key = list[i];
      let j;

      for (j = i - 1; j >= 0 && list[j] > key; j--) {
         steps.push({type: "read", indices: [j, i]});
         list[j + 1] = list[j];
         steps.push({type: "write", indices: [j + 1, j]});
         listPositions.push([...list]);
      }

      list[j + 1] = key;
      steps.push({type: "write", indices: [j + 1, j]});
      listPositions.push([...list]);
   }

   return [steps, listPositions];
}

function combSort(list) {
   let n = list.length;
   let steps = [];
   let listPositions = [[...list]];
   let swapped = true;
   let gap = n;

   while (gap != 1 || swapped) {
      gap = parseInt((gap * 10) / 13);
      if (gap < 1) gap = 1;

      swapped = false;

      for (let i = 0; i < n - gap; i++) {
         if (list[i] > list[i + gap]) {
            steps.push({type: "read", indices: [i, i + gap]});
            [list[i], list[i + gap]] = [list[i + gap], list[i]];
            steps.push({type: "write", indices: [i, i + gap]});
            listPositions.push([...list]);
            swapped = true;
         }
      }
      
   }

   return [steps, listPositions];
}