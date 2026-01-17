// some comments are for API conc review //
const express = require('express');
const { start } = require('node:repl');
const app = express();
const port = 8080;

app.use(express.text()) // Middleware, used to PARSE data //

const fileName = 'common-5L-words.txt';
const filePath = `../public/${fileName}`;
let wordList =[];

const fs = require('fs');
fs.readFile(filePath,'utf8',(err,data)=>{
    if (err) {
        console.error(err);
        return;
    }
    wordList = data.split('\n');
})

let getWord=()=>{
    const today = new Date();
    const quadDayIndex = Math.floor(today.getTime() / (1000 * 60 * 60 * 6)); // Rotates word every 6 hours //
    const word = wordList[quadDayIndex % wordList.length];
    return word;
}

// setTimeout(()=>{console.log(getWord())},1000) //

app.get('/api/word',(req,res)=>{ // word is an API endpoint, not a url path to any file in the repo! //
    const currWord = getWord();
    res.send(currWord);
});

app.listen(port, ()=>{
    console.log(`Server live on port ${port}`)
})