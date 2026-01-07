let height = 6;
let width = 7;

let word = 'SEVENTY';
let bonusSq = '-D--T--';

let gameEnd = false;

let row = 0;    // CURRENT ROW AND COL //
let col = 0;

const scrabPTS = { 'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1, 'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1, 'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10 };

const alpha = Object.entries(scrabPTS).map(([letter, points]) => { return { letter, points }; });

window.onload = function(){
    gameInit();
}

gameInit = () => {

    let keyboardDiv = document.getElementById('keyboard');
    

    for (let r=0;r<height;r++){
        for (let c=0;c<width;c++){
            let tile = document.createElement('span');
            tile.id = r.toString() + '-' + c.toString()
            tile.className = 'tile';
            tile.innerText = '';
            document.getElementById('board').appendChild(tile);
        }
    }

    for (let i=0;i<4;i++) {
        let n = 7; // Sorry i didnt want to think much for this,//
                   // n is the no. of keys per row //
        if (i==3) {
            n -= 2;
        }
        for (let j=0;j<n;j++) {
            let keycap = document.createElement('button');
            keycap.className = 'keycap';
            let currAlphabetNo = i*7 + j
            if (currAlphabetNo <= 25) {
                let keyLetter = document.createElement('span');
                keyLetter.className = 'keyLetter';
                let keyNum = document.createElement('div');
                keyNum.className = 'keyNum';
                keyNum.innerText = alpha[currAlphabetNo].points;
                keyLetter.innerText = alpha[currAlphabetNo].letter;
                keycap.appendChild(keyLetter);
                keycap.appendChild(keyNum);
            } else if (currAlphabetNo == 27){
                keycap.innerText = '>';
                keycap.style.backgroundColor = 'blue';
            } else {
                keycap.innerText = 'DEL';
                keycap.style.backgroundColor = 'red';
            }
            keyboardDiv.append(keycap);
            
        }
    }

    keyboardDiv.addEventListener('click',(event)=>{
        let keyPressed = event.target.closest('button').getElementsByClassName('keyLetter')[0].innerText;
        if (keyPressed) {
            keyPressed = 'Key' + keyPressed;
            onAdd(keyPressed);
        }
    })

    let enterKey = document.getElementById('enterKey');
    enterKey.addEventListener('click',()=>{
        onAdd('Enter');
    })
    let backspaceKey = document.getElementById('backspaceKey');
    backspaceKey.addEventListener('click',()=>{
        onAdd('Backspace');
    })
}

let getTile = (r,c) => {
    let tile = document.getElementById(r.toString()+'-'+c.toString());
    return tile;
}

let addWord = (letter) => {
    tile = getTile(row,col);
    let keyNum = document.createElement('span');
    let keyLetter = document.createElement('span');
    keyLetter.innerText = letter;
    keyLetter.className = 'keyLetter';
    keyLetter.style.fontSize = 'min(30px,4.5vw)';
    keyNum.className = 'keyNum';
    keyNum.innerText = scrabPTS[letter].toString();
    keyNum.style.fontSize = 'min(10px,2.5vw)';
    tile.appendChild(keyLetter);
    tile.appendChild(keyNum);
}

let rmWord = () => {
    tile = getTile(row,col);
    tile.innerText = '';
}

let checkWord = () => {

   // Checks if word in dictionary + Check if word matches and give hints // 
    for (let n=0;n<width;n++){
        getTile(row,n).classList.add('absent');
    }

    let corrCnt = 0; // Count for correct letters, if reaches width, plr wins // 
    let wordOnTiles = '';
    for (let i =0;i<width;i++) {
        wordOnTiles += getTile(row,i).getElementsByClassName('keyLetter')[0].innerText;
    }

    for (let i=0;i<width;i++){
        for (let j=0;j<width;j++){
            if (word[i] === wordOnTiles[j]) {
                if (i == j) {
                    corrCnt += 1;
                    getTile(row,j).classList.replace('absent','correct');
                    getTile(row,j).classList.replace('present','correct');
                } else {
                    getTile(row,j).classList.replace('absent','present');
                }
            }
        }
    }

    if (corrCnt == width) {
        return 'Win';
    } else {
        return 'Cont';
    }
}

// LISTEN FOR KEYPRESS //
document.addEventListener('keyup',(event)=>{
    key = event.code
    onAdd(key);
})

onAdd = (keyCode) => {
    if (gameEnd) return;
    
    if (row == height && !gameEnd) {
        gameEnd = true;
    }

    if ("KeyA" <= keyCode && "KeyZ" >= keyCode) {
        if (col < width) {
            addWord(keyCode[3]);
            col += 1;
        }
    } else if (keyCode === 'Enter') {
        
        if (col == width) { // $width is a non-existent number in the grid //
            let status = checkWord();
            switch (status){
                case 'Win':
                    gameEnd = true;
                    return;
                case 'Cont':
                    col = 0
                    row += 1 
            }
            
        } else (
            alert('Not enough letters!')
        )
    } else if (keyCode === 'Backspace') {
        if (col > 0) {
            col -= 1
            rmWord();
        }
    }
}
