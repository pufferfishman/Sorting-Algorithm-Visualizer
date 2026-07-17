let settings = {
   bars: 64,
   delay: 15,
   shuffle: "fisher-yates",
   sort: "bubble"
}

let list = resetList();
render();

function resetList() {
   let tempList = [];
   for (let i = 1; i <= settings.bars; i++) {tempList.push(i);}
   return tempList;
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

function render(indices, checked, clear) { // indices = which indices to highlight red, checked = how many indices to highlight green, clear = clear screen
   let sav = document.getElementById("sav");
   sav.innerHTML = "";

   for (let i = 0; i < list.length; i++) {
      var bar = document.createElement("div");

      bar.classList.add("bar");
      bar.style.height = map(list[i], 0, list.length, 0, 100) + "%"; // calculate the percent of total height the bar takes up
      bar.style.width = 100 / list.length + "%"; // calculate the percent of total width the bar takes up

      if (indices && indices.includes(i)) {
         bar.style.backgroundColor = "var(--red)";
      } else if (checked >= i) {
         bar.style.backgroundColor = "var(--green)";
      } else {
         bar.style.backgroundColor = "var(--white)";
      }

      sav.appendChild(bar);
   }
}

function play() {
   var swaps = window[settings.sort + "Sort"]([...list]);
   console.log(swaps)
   function animate() {
      if (swaps.length == 0) {
         let k = 0;
         function completionCheck() {
            render(undefined, k);
            k++;
            if (k < list.length) {
               setTimeout(completionCheck, 500 / settings.bars);
            } else {
               setTimeout(render, 250, [undefined, undefined, true]);
            }
         }
         completionCheck();
         render();
         return;
      }

      let [i, j] = swaps.shift();
      [list[i], list[j]] = [list[j], list[i]];
      render([i, j]);
      setTimeout(animate, settings.delay);
   }
   animate();
}

function bubbleSort(list) {
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
}

function map(value, low1, high1, low2, high2) {return low2 + (high2 - low2) * (value - low1) / (high1 - low1);}