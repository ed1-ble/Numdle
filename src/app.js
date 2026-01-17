let height = 4;
let width = 5;

let word = 'WHICH';
let bonusSq = '-TD--';

let gameEnd = false;

const loadTime = 2;

let row = 0;    // CURRENT ROW AND COL //
let col = 0;

const scrabPTS = {
  'Q': 10, 'W': 4, 'E': 1, 'R': 1, 'T': 1, 'Y': 4, 'U': 1, 'I': 1, 'O': 1, 'P': 3,
  'A': 1, 'S': 1, 'D': 2, 'F': 4, 'G': 2, 'H': 4, 'J': 8, 'K': 5, 'L': 1,
  'Z': 10, 'X': 8, 'C': 3, 'V': 4, 'B': 3, 'N': 1, 'M': 3
};

const alpha = Object.entries(scrabPTS).map(([letter, points]) => { return { letter, points }; });

// Calculate total score hint //
let totalScore = 0;
for (let i=0;i<width;i++) {
    let bonus = 1;
    switch (bonusSq[i]){
        case 'D':
            bonus = 2;
            break;
        case 'T':
            bonus = 3;
            break;
    }
    totalScore += scrabPTS[word[i]]*bonus;
}

window.onload = function(){
    gameInit();
}

let addAlphaKey = (keyName,keycap) =>{
    let keyLetter = document.createElement('span');
    keyLetter.className = 'keyLetter';
    keyLetter.innerText = keyName;
    let keyNum = document.createElement('div');
    keyNum.className = 'keyNum';
    keycap.appendChild(keyNum);
    keyNum.innerText = scrabPTS[keyName];
    keycap.appendChild(keyLetter);
}

const backspaceKeyChar = '⌫';
const enterKeyChar = '⏎';

let addInputKey = (keyName,keycap) => {
    let keyLetter = document.createElement('span');
    keyLetter.className = 'keyLetter';
    if (keyName === 'Enter') {
        keyLetter.innerText = enterKeyChar;
    } else {
        keyLetter.innerText = backspaceKeyChar;
    }
    keycap.appendChild(keyLetter);
}

let addExampleTile = (text,parent,type) =>{
    let tile = document.createElement('span');
    tile.className = 'tile';
    tile.innerText = text;
    tile.style.fontSize = 'clamp(15px,5vw,25px)';
    tile.style.height = 'clamp(18px,8vw,36px)';
    tile.style.width = 'clamp(18px,8vw,36px)';
    tile.style.display = 'flex';
    tile.style.alignItems = 'center';
    tile.style.justifyContent = 'center';

    switch (type) {
        case "correct":
            tile.classList.add('correct');
            break;
        case "absent":
            tile.classList.add('absent');
            break;
        case "present":
            tile.classList.add('present');
            break;
        case "TL":
            tile.classList.add('tripleLetter');
            break;
        case "DL":
            tile.classList.add('doubleLetter');
            break;
   4}

    parent.appendChild(tile);
    return tile;
}

let addExampleWord = (w,parent,format) => {
    let exword = document.createElement('div');
    exword.className = 'exampleWord';
    parent.appendChild(exword);
    format = format.split('-')
    w.split('').forEach((letter,i)=>{
        let tile = addExampleTile(letter,exword,format[i]);
    })
    return exword;
}

let addExample = (w,parent,format,text) =>{
    addExampleWord(w,parent,format);

    let p = document.createElement('p');
    p.innerText = text;
    parent.appendChild(p);
}

let initTutorialWindow = (innerhtml) =>{

    let innerWindow = document.createElement('div');
    innerWindow.className = 'innerWindow';
    innerWindow.style.opacity = 0;
    innerWindow.style.pointerEvents = 'none';
    let cancelButton = document.createElement('button');
    cancelButton.className = 'closeWindowButton';
    cancelButton.innerText = 'X';
    innerWindow.append(cancelButton);
    document.getElementById('topbar').append(innerWindow);
    let htmlContent = document.createElement('div');
    htmlContent.innerHTML = innerhtml;
    innerWindow.appendChild(htmlContent);

    cancelButton.addEventListener('click',()=>{
        innerWindow.style.opacity = 0;
        innerWindow.style.pointerEvents = 'none';
    })

    // Append TUTORIAL EXAMPLES, format: split by '-' //

    addExample('SCRAP',innerWindow,'correct- - - - ',
        'S is in the word and in the correct spot'
    );
    addExample('WORDY',innerWindow,' -present- - - ',
        'O is in the word but in the wrong spot'
    );
    addExample('LIGHT', innerWindow, ' - - -absent- ',
        'H is not in the word in any spot'
    );
    addExample('GLAZE',innerWindow, ' - -TL- - ',
        'A is worth 1 * 3 = 3 points as its placed on a triple bonus'
    );
    addExample('GOOFY',innerWindow,' - - - -DL',
        'Y is worth 4 * 2 = 8 points as its placed on a double bonus'
    );
    addExample('FAILS',innerWindow, 'correct-correct-correct-correct-correct-correct-correct',
        'without any bonuses, FAILS is worth F(4) + A(1) + I(1) + L(1) + S(1) = 8 points'
    )

    return innerWindow;
}

let showNotification = (message,duration) => {
    let notification = document.createElement('span');
    notification.className = 'notification';
    notification.innerText = message;
    notification.style.animationDuration = duration.toString() + 's';
    const notificationBox = document.getElementById('notificationBox');
    notificationBox.append(notification);

    notification.addEventListener('animationend',()=>{
        notification.remove();
    })
}

const tutorialHTML = `<h1 style='color:white;'>How to Play</h1>
            <h3 style='color:lightgray'>Guess the word in ${height} tries, smells like Scrabble though.</h3>
            <ul style='color:white;'>
                <li>Each guess must be a valid ${width}-letter word</li>
                <li>The color of the tiles will change to show how close your guess was</li>
                <li>The sum of points is given as a hint, there may or may not be BONUS SQUARES, which multiply the points of a letter</li>
            </ul>
            <h2 style='color:white;'>Examples</h2>`

 
let sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve,ms));
}


// Prevent weird looks before loading finishes by adding load countdown//
async function loadScreen(){
    let loadingscreen = document.createElement('div');
    loadingscreen.className = 'loadingScreen';
    let loadingtext = document.createElement('span');
    loadingtext.className = 'loadText'
    loadingscreen.appendChild(loadingtext);
    const topbar = document.getElementById('topbar');
    topbar.append(loadingscreen);

    const funText = ['Shuffling tiles, hang on for ','Drawing letters, give us ', 'Board nearly set-up, just wait ']
    const ranFunText = funText[Math.floor(Math.random()*funText.length)];

    for (let i = loadTime; i > 0; i--) {
        loadingtext.innerText = ranFunText + i + 's...';
        await sleep(1000);
    }

   loadingscreen.remove();
}

// Preload the word list //
async function getWordList(){
    const url = 'public/words.txt';
    return fetch(url)
        .then(response => {return response.text()}) // .text() is a middleware //
        .then(result =>{return result.split('\n');})
        .catch((error)=>{console.error(error)})
}

async function getTodaysWord(){
    const url = '/api/word';
    return fetch(url)
        .then(response => {return response.text()})
        .then(result =>{return result})
        .catch((error)=>{console.error(error)})
}

let wordList = [];

async function gameInit (){

    loadScreen();
    
    word;
    try {
        word = await getTodaysWord();
        console.log(word);
    } catch (err){console.error(err.message)}

    wordList;
    try {
        wordList = await getWordList();
        console.log(wordList);
    } catch (error) {
        console.error(error.message);
    }
 
    let keyboardDiv = document.getElementById('keyboard');

    let header = document.getElementById('header');
    header.innerText = `Word score: ` + totalScore.toString();

    let tutorialWindow = initTutorialWindow(tutorialHTML);

    let tilesList = [];

    // Initialize Board Tiles //

    for (let r=0;r<height;r++){
        for (let c=0;c<width;c++){
            let tile = document.createElement('span');
            tile.id = r.toString() + '-' + c.toString()
            tile.className = 'tile';
            tile.innerText = '';
            // Assign bonus Squares //
            if (bonusSq[c] === 'D') {
                tile.classList.add('doubleLetter');
                tile.innerText = 'Double Letter';
            } else if (bonusSq[c] === 'T') {
                tile.classList.add('tripleLetter');
                tile.innerText = 'Triple Letter';
            }

            document.getElementById('board').appendChild(tile);
            tilesList.push(tile);
        }
    }

    // Play a starting flip anim for tiles after loading just for looks //
    setTimeout(()=>{
        tilesList.forEach((t)=>{
            flipAnim(t,null);
        })
    },loadTime*1000);

    // Initialize the Keyboard //
    let currAlphabetNo = 0;
    for (let i=1;i<4;i++) {
        let n = 10;

        if (i != 1) {
            n = 9;
        }

        let currKeyboardRowName = 'kbrow'+i.toString();
        let currKeyboardRow = document.getElementById(currKeyboardRowName);
        for (let j=0;j<n;j++) {
            let keycap = document.createElement('button');
            keycap.className = 'keycap';
            
            if (j == 0 && i == 3) {
                // Add Enter Key //
                addInputKey('Enter',keycap);
            } else if (currAlphabetNo <= 25) {
                addAlphaKey(alpha[currAlphabetNo].letter,keycap);
                // Assign id to each keycap to be recognized for blackening //
                keycap.id = 'Key' + alpha[currAlphabetNo].letter;
                currAlphabetNo += 1;
            } else {
                // Add Backspace Key //
                addInputKey('Backspace',keycap);
            }
            currKeyboardRow.append(keycap);
            
        }
    }

    keyboardDiv.addEventListener('click',(event)=>{
        let keyPressed = event.target.closest('button').getElementsByClassName('keyLetter')[0].innerText;
        if (keyPressed) {
            if (keyPressed === backspaceKeyChar) {
                keyPressed = 'Backspace';
            } else if (keyPressed === enterKeyChar) {
                keyPressed = 'Enter';
            } else {
                keyPressed = 'Key' + keyPressed;
            }
            onAdd(keyPressed);
        }
    })  

    let tutorialButton = document.getElementById('tutorialButton');
    tutorialButton.addEventListener('click',()=>{
       tutorialWindow.style.opacity = 1;
       tutorialWindow.style.pointerEvents = 'auto';
    })
}

let getTile = (r,c) => {
    let tile = document.getElementById(r.toString()+'-'+c.toString());
    return tile;
}

const arrowChar = '⇆';

let addWord = (letter) => {
    tile = getTile(row,col);
    let keyNum = document.createElement('span');
    let keyLetter = document.createElement('span');

    keyLetter.innerText = letter;
    keyLetter.className = 'keyLetter';
    keyLetter.style.fontSize = 'min(25px,4.5vw)';

    keyNum.className = 'keyNum';
    keyNum.innerText = scrabPTS[letter].toString();
    keyNum.style.fontSize = 'clamp(8px,1.5vw,15px)';

    // Modification for Bonus Squares //
    if (bonusSq[col] === 'D') {
        tile.classList.replace('doubleLetter',null);
        tile.innerText = '';
        keyNum.style.color = '#ADD8E6';
        keyLetter.style.color = '#ADD8E6';
        keyNum.innerText = `${keyNum.innerText}${arrowChar}`;
     //   keyNum.innerText = (Number(keyNum.innerText) * 2).toString(); //
    } else if (bonusSq[col] === 'T') {
        tile.classList.replace('tripleLetter',null);
        tile.innerText = '';
        keyNum.style.color = '#00AEEF';
        keyLetter.style.color = '#00AEEF';
        keyNum.innerText = `${keyNum.innerText}${arrowChar}`;
     //   keyNum.innerText = (Number(keyNum.innerText) * 3).toString(); //
    }

    tile.appendChild(keyLetter);
    tile.appendChild(keyNum);
}

let rmWord = () => {
    tile = getTile(row,col);
    tile.innerText = '';

    // Modification for Bonus Squares //
    if (bonusSq[col] === 'D') {
        tile.classList.add('doubleLetter');
        tile.innerText = 'Double Letter';

    } else if (bonusSq[col] === 'T') {
        tile.classList.add('tripleLetter');
        tile.innerText = 'Triple Letter';
    }

}

async function winEffects() {
    for (let i=0;i<width;i++){
        const tile = getTile(row,i);
        tile.classList.add('spinning');
        setTimeout(()=>{
            tile.classList.remove('spinning');
            
        },1200);
    }
    showNotification('No. 1 Victory Royale!!',2);
}

async function flipAnim(tile,finalClass){
    tile.classList.add('flipping');
    setTimeout(()=>{
        tile.classList.add(finalClass);
    },300);
    setTimeout(()=>{
        tile.classList.remove('flipping');
    },600);
}

let letterIgnoreList = [];
// a list of absent letters, used to ignore input for target keys //

let checkWord = () => {

    let corrCnt = 0; // Count for correct letters, if reaches width, plr wins // 
    let wordOnTiles = '';
    for (let i =0;i<width;i++) {
        wordOnTiles += getTile(row,i).getElementsByClassName('keyLetter')[0].innerText;
    }

   // Checks if word in dictionary //
    if (!wordList.includes(wordOnTiles.toLowerCase())) {
        showNotification('Not in word list',2);
        return
    }

    let hintPattern = new Array(5).fill('absent');

    let presentLetters = [];

    for (let i=0;i<width;i++){
        for (let j=0;j<width;j++){
            if (word[i] === wordOnTiles[j]) {
                if (i == j) {
                    corrCnt += 1;
                    hintPattern[j] = 'correct';
                } else {
                    hintPattern[j] = 'present';
                }
                if (presentLetters.includes(wordOnTiles[j]) == false) {
                    presentLetters += [wordOnTiles[j]];
                }
            }
        }
    }

    for (let i=0;i<width;i++) {
        flipAnim(getTile(row,i),hintPattern[i]);
    }

    // Using presentLetters, blacken FAILED keys for better readability //
    wordOnTiles.split('').forEach((letter)=>{
        if (presentLetters.includes(letter) == false) {
            const targetKey = document.getElementById('Key'+letter);
            targetKey.style.backgroundColor = 'grey';

            if (letterIgnoreList.includes(letter) == false) {
                letterIgnoreList += [letter];
            }
        }
    })

    if (corrCnt == width) {
        // Victory Effects!! //
        winEffects();
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
                    break;
                case 'Cont':
                    col = 0
                    row += 1 
                    if (row == height && !gameEnd) {
                        gameEnd = true;
                        showNotification(word, 15);
                        return;
                    }
                    break;
            }
            
        } else (
            showNotification('Not enough letters!',2)
        )
    } else if (keyCode === 'Backspace') {
        if (col > 0) {
            col -= 1
            rmWord();
        }
    }
}

document.addEventListener("dblclick", function (event) {
    event.preventDefault();
}, { passive: false }); // Disables double click zooming //