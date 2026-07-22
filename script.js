let list;
let settings = {
   n: 64,
   rainbow: false,
   sort: "bubble",
   readDelay: 4,
   writeDelay: 4,
   auxiliaryDelay: 4,
   base: 16
}
let stopSort;

reset(false);

function reset(stop) {
   let tempList = [];
   for (let i = 1; i <= settings.n; i++) { tempList.push(i); }
   list = tempList;

   if (!stopSort && stop) { stopSort = true; } else { stopSort = false; }

   render();
}

function shuffle() {
   let [steps, listPositions] = shuffleSort([...list]);
   let j = 0;

   function animate() {
      if (steps.length === 0) {
         render();
         return;
      };

      let step = steps.shift();
      j++;
      list = listPositions[j];
      render({ writeIndices: step.indices });

      setTimeout(animate, 500 / list.length);
   }
   animate();
}

function shuffleSort(list) {
   let steps = [];
   let listPositions = [[...list]];

   for (let i = 0; i < list.length; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
      steps.push({ type: "write", indices: [i, j] });
      listPositions.push([...list]);
   }

   return [steps, listPositions];
}

function render(indices = {}) {
   let sav = document.getElementById("sav");
   sav.innerHTML = "";
   const { readIndices, writeIndices, auxiliaryIndices, checked, clear } = indices;
   for (let i = 0; i < list.length; i++) {
      var bar = document.createElement("div");

      bar.classList.add("bar");
      bar.style.height = map(list[i], 0, list.length, 0, 100) + "%";
      bar.style.width = 100 / list.length + "%";

      if (writeIndices && writeIndices.includes(i)) {
         bar.style.backgroundColor = settings.rainbow ? "var(--white)" : "var(--red)";
      } else if (readIndices && readIndices.includes(i)) {
         bar.style.backgroundColor = settings.rainbow ? "var(--white)" : "var(--blue)";
      } else if (auxiliaryIndices && auxiliaryIndices.includes(i)) {
         bar.style.backgroundColor = settings.rainbow ? "var(--white)" : "var(--yellow)";
      } else if (checked >= i) {
         bar.style.backgroundColor = settings.rainbow ? "var(--white)" : "var(--green)";
      } else {
         //bar.style.backgroundColor = "var(--white)";
         bar.style.backgroundColor = settings.rainbow ? `hsl(${map(list[i], 0, list.length, 0, 360)}, 100%, 50%)` : "var(--white)";
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
            render({ checked: k });
            k++;
            if (k < list.length) {
               setTimeout(completionCheck, 4);
            } else {
               setTimeout(render, 250, { clear: true });
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
         render({ readIndices: step.indices });
         delay = settings.readDelay;
      } else if (step.type === "write") {
         j++;
         list = listPositions[j];
         render({ writeIndices: step.indices });
         delay = settings.writeDelay;
      } else if (step.type === "auxiliary") {
         render({ auxiliaryIndices: step.indices });
         delay = settings.auxiliaryDelay;
      }
      setTimeout(animate, delay);
   }
   animate();
}

function map(value, low1, high1, low2, high2) { return low2 + (high2 - low2) * (value - low1) / (high1 - low1); }










// USER INTERFACE
document.getElementById("algorithm-dropdown").addEventListener("change", (e) => {
   settings.sort = e.target.value;
});

document.getElementById("n-slider").addEventListener("input", (e) => {
   let exponent = Number(e.target.value);
   let actualValue = 16 * Math.pow(2, exponent);

   settings.n = actualValue;
   reset(false)
   render();
   console.log(actualValue)
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
         steps.push({ type: "read", indices: [j, j + 1] });

         if (list[j] > list[j + 1]) { // if the current element is greater than the next element

            [list[j], list[j + 1]] = [list[j + 1], list[j]]; // swap the current element and the next element
            steps.push({ type: "write", indices: [j, j + 1] });
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
         steps.push({ type: "read", indices: [j, j + 1] });

         if (list[j] > list[j + 1]) { // if the current element is greater than the next element

            [list[j], list[j + 1]] = [list[j + 1], list[j]]; // swap the current element and the next element
            steps.push({ type: "write", indices: [j, j + 1] });
            listPositions.push([...list]);
            swapped = true;
         }
      }

      if (!swapped) break;
      end--;

      swapped = false;
      for (let j = end - 1; j >= start; j--) { // loop over each element in the list
         steps.push({ type: "read", indices: [j, j + 1] });

         if (list[j] > list[j + 1]) { // if the current element is greater than the next element
            [list[j], list[j + 1]] = [list[j + 1], list[j]]; // swap the current element and the next element
            steps.push({ type: "write", indices: [j, j + 1] });
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
         if (list[j] < list[smallest]) { smallest = j } // is this the smallest element yet
         steps.push({ type: "read", indices: [smallest, j] });
      }

      [list[i], list[smallest]] = [list[smallest], list[i]]; // swap the current index with the smallest element
      steps.push({ type: "write", indices: [i, smallest] });
      listPositions.push([...list]);
   }

   return [steps, listPositions];
}

function insertionSort(list) {
   let n = list.length;
   let steps = [];
   let listPositions = [[...list]];

   for (let i = 1; i < n; i++) {
      let key = list[i];
      let j;

      for (j = i - 1; j >= 0 && list[j] > key; j--) {
         steps.push({ type: "read", indices: [j, i] });
         list[j + 1] = list[j];
         steps.push({ type: "write", indices: [j + 1, j] });
         listPositions.push([...list]);
      }

      list[j + 1] = key;
      steps.push({ type: "write", indices: [j + 1, i] });
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
         steps.push({ type: "read", indices: [i, i + gap] });
         if (list[i] > list[i + gap]) {
            [list[i], list[i + gap]] = [list[i + gap], list[i]];
            steps.push({ type: "write", indices: [i, i + gap] });
            listPositions.push([...list]);
            swapped = true;
         }
      }

   }

   return [steps, listPositions];
}

function heapSort(list) {
   let n = list.length;
   let steps = [];
   let listPositions = [[...list]];

   function heapify(list, n, i) {
      let largest = i;
      let left = 2 * i + 1;
      let right = 2 * i + 2;

      if (left < n) {
         steps.push({ type: "read", indices: [left, largest] });
         if (list[left] > list[largest]) { largest = left; }
      }

      if (right < n) {
         steps.push({ type: "read", indices: [right, largest] });
         if (list[right] > list[largest]) { largest = right; }
      }

      if (largest != i) {
         [list[i], list[largest]] = [list[largest], list[i]];
         steps.push({ type: "write", indices: [i, largest] });
         listPositions.push([...list]);

         heapify(list, n, largest);
      }
   }

   for (let i = Math.floor(n / 2) - 1; i >= 0; i--) { heapify(list, n, i); }

   for (let i = n - 1; i > 0; i--) {
      [list[0], list[i]] = [list[i], list[0]];
      steps.push({ type: "write", indices: [0, i] });
      listPositions.push([...list]);

      heapify(list, i, 0);
   }

   return [steps, listPositions];
}

function shellSort(list) {
   let n = list.length;
   let steps = [];
   let listPositions = [[...list]];

   for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      for (let i = gap; i < n; i++) {
         let temp = list[i];
         let j;

         for (j = i; j >= gap && list[j - gap] > temp; j -= gap) {
            steps.push({ type: "read", indices: [j - gap, i] });
            list[j] = list[j - gap];
            steps.push({ type: "write", indices: [j, j - gap] });
            listPositions.push([...list]);
         }

         list[j] = temp;
         steps.push({ type: "write", indices: [j, i] });
         listPositions.push([...list]);
      }
   }

   return [steps, listPositions];
}

function mergeSort(list) {
   let n = list.length;
   let steps = [];
   let listPositions = [[...list]];

   function merge(list, left, mid, right) {
      let leftList = list.slice(left, mid + 1);
      let rightList = list.slice(mid + 1, right + 1);

      for (let i = left; i <= mid; i++) {
         steps.push({ type: "auxiliary", indices: [i] });
      }

      for (let i = mid + 1; i <= right; i++) {
         steps.push({ type: "auxiliary", indices: [i] });
      }

      let i = 0;
      let j = 0;
      let k = left;

      while (i < leftList.length && j < rightList.length) {
         steps.push({ type: "read", indices: [left + i, mid + 1 + j] });

         if (leftList[i] <= rightList[j]) {
            list[k] = leftList[i];
            i++;
         } else {
            list[k] = rightList[j];
            j++;
         }

         steps.push({ type: "write", indices: [k] });
         listPositions.push([...list]);
         k++;
      }

      while (i < leftList.length) {
         list[k] = leftList[i];
         steps.push({ type: "write", indices: [k] });
         listPositions.push([...list]);
         i++;
         k++;
      }

      while (i < rightList.length) {
         list[k] = rightList[j];
         steps.push({ type: "write", indices: [k] });
         listPositions.push([...list]);
         j++;
         k++;
      }
   }
   
   function sort(list, left, right) {
      if (left >= right) {return;}
      let mid = Math.floor((left + right) / 2);
      sort(list, left, mid);
      sort(list, mid + 1, right);
      merge(list, left, mid, right);
   }

   sort(list, 0, n - 1);

   return [steps, listPositions];
}

function quickLomaroSort(list) {
   let n = list.length;
   let steps = [];
   let listPositions = [[...list]];

   function partition(list, low, high) {
      let pivot = list[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
         steps.push({ type: "read", indices: [j, high] });
         
         if (list[j] < pivot) {
            i++;
            if (i !== j) {
               [list[i], list[j]] = [list[j], list[i]];
               steps.push({ type: "write", indices: [i, j] });
               listPositions.push([...list]);
            }
         }
      }

      if (i + 1 !== high) {
         [list[i + 1], list[high]] = [list[high], list[i + 1]];
         steps.push({ type: "write", indices: [i + 1, high] });
         listPositions.push([...list]);
      }

      return (i + 1);
   }

   function sort(list, low, high) {
      if (low < high) {
         let pivotIndex = partition(list, low, high);
         sort(list, low, pivotIndex - 1);
         sort(list, pivotIndex + 1, high);
      }
   }

   sort(list, 0, n - 1);

   return [steps, listPositions];
}

function quickHoareSort(list) {
   let n = list.length;
   let steps = [];
   let listPositions = [[...list]];

   function partition(list, low, high) {
      let pivot = list[Math.floor((low + high) / 2)];
      let i = low - 1;
      let j = high + 1;

      while (true) {
         do {
            i++;
            if (i !== j) steps.push({ type: "read", indices: [i, high] }); // comparing against pivot
         } while (list[i] < pivot);

         do {
            j--;
            steps.push({ type: "read", indices: [j, high] });
         } while (list[j] > pivot);

         if (i >= j) return j;

         [list[i], list[j]] = [list[j], list[i]];
         steps.push({ type: "write", indices: [i, j] });
         listPositions.push([...list]);
      }
   }

   function sort(list, low, high) {
      if (low < high) {
         let p = partition(list, low, high);
         sort(list, low, p);
         sort(list, p + 1, high);
      }
   }

   sort(list, 0, n - 1);

   return [steps, listPositions];
}


function radixSort(list) {
   let n = list.length;
   let steps = [];
   let listPositions = [[...list]];
   let max = Math.max(...list);
   let base = settings.base;

   for (let place = 1; Math.floor(max / place) > 0; place *= base) {
      let buckets = Array.from({ length: base }, () => []);

      for (let i = 0; i < n; i++) {
         steps.push({ type: "read", indices: [i] });
         let digit = Math.floor(list[i] / place) % base;
         buckets[digit].push(list[i]);
         steps.push({ type: "auxiliary", indices: [i] });
      }

      let index = 0;
      for (let digit = 0; digit < base; digit++) {
         for (let k = 0; k < buckets[digit].length; k++) {
            list[index] = buckets[digit][k];
            steps.push({ type: "write", indices: [index] });
            listPositions.push([...list]);
            index++;
         }
      }

   }

   return [steps, listPositions];
}

function bucketSort(list) {
   let n = list.length;
   let steps = [];
   let listPositions = [[...list]];
   let bucketCount = settings.base;
   let buckets = Array.from({ length: bucketCount }, () => []);

   for (let i = 0; i < n; i++) {
      steps.push({ type: "read", indices: [i] });
      let bucketIndex = Math.min(
         Math.floor(((list[i] - 1) / n) * bucketCount),
         bucketCount - 1
      );
      buckets[bucketIndex].push(list[i]);
      steps.push({ type: "auxiliary", indices: [i] });
   }

   let index = 0;
   for (let i = 0; i < buckets.length; i++) {
      for (let j = 0; j < buckets[i].length; j++) {
         list[index] = buckets[i][j];
         steps.push({ type: "write", indices: [index] });
         listPositions.push([...list]);
         index++
      }
   }

   for (let i = 1; i < n; i++) {
      let key = list[i];
      let j;

      for (j = i - 1; j >= 0 && list[j] > key; j--) {
         steps.push({ type: "read", indices: [j, i] });
         list[j + 1] = list[j];
         steps.push({ type: "write", indices: [j + 1, j] });
         listPositions.push([...list]);
      }

      list[j + 1] = key;
      steps.push({ type: "write", indices: [j + 1, i] });
      listPositions.push([...list]);
   }

   return [steps, listPositions];
}

function countingSort(list) {
   let n = list.length;
   let steps = [];
   let listPositions = [[...list]];
   let max = Math.max(...list);
   let countList = new Array(max + 1).fill(0);

   for (let i = 0; i < n; i++) {
      steps.push({ type: "read", indices: [i] });
      countList[list[i]]++;
      steps.push({ type: "auxiliary", indices: [i] });
   }

   for (let i = 1; i <= max; i++) {
      countList[i] += countList[i - 1];
   }

   let output = new Array(n);
   for (let i = n - 1; i >= 0; i--) {
      steps.push({ type: "read", indices: [i] });
      let value = list[i];
      countList[value]--;
      output[countList[value]] = value;
   }

   for (let i = 0; i < n; i++) {
      list[i] = output[i];
      steps.push({ type: "write", indices: [i] });
      listPositions.push([...list]);
   }


   return [steps, listPositions];
}