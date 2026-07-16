let settings = {
   bars: 100,
   tickSpeed: 1,
   shuffle: "fisher-yates",
   sort: "bubble"
}

let list = resetList();
console.log(list)

function resetList() {
   let tempList = [];
   for (let i = 1; i <= settings.bars; i++) {tempList.push(i);}
   return tempList;
}

function shuffleList() {
   switch(settings.shuffle) {
      case "fisher-yates":
         for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
         }
   }
}

function render(indices, ) {

}