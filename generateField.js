const fieldURL = "http://localhost:8888/getField"
const turnURL = "http://localhost:8888/turn"
let field = []
let turn_open_cells = []
let fieldHeight = 0
let fieldWidth = 0

const printField = () => {
    const mainField = document.getElementById('mainField');//document.querySelector("#field")
    const minesCol = document.getElementById('MinesCol');
    mainField.innerHTML = null;
    let height = field.length - 2
    let width = field[0].length - 2
    fieldHeight = height
    fieldWidth = width
    const restartButton = document.getElementById('SeregaRubanov')
    restartButton.style.left = '156px'
    restartButton.style.top = '11px'
    restartButton.style.width = '56px'
    restartButton.style.height = '56px'
    const posMines = document.querySelector("#Panel > div.countArea")
    const posTimer = document.querySelector("#Panel > div.timerArea")
    posMines.style.left = '20px'
    posMines.style.top = '15px'
    posTimer.style.top = '15px'
    //console.log(field)
    let sum = 0
    for(let i = 1; i <= height; i++){
        for(let j = 1; j <= width; j++){
            sum++;
            let s = ""
            if(field[i][j] === 0){
                s = "empty_field"
            }
            if(field[i][j] === -1){
                s = "bomb"
            }
            if(field[i][j] > 0){
                s = `around${field[i][j]}`
            }
            mainField.insertAdjacentHTML('beforeend',
            `<button class="cell notOpen ${s}" id="${sum}">${field[i][j]}</button>`);//${field[i][j]}
        }
        mainField.insertAdjacentHTML('beforeend', `<br>`)
    }
    mainField.style.width = `${40 * width + 10}px`
    mainField.style.height = `${40 * height + 10}px`
    let mines = 0
    if(width === 9) mines = 10
    if(width === 16) mines = 40
    if(width === 30) mines = 99
    minesCol.innerText = `0${mines}`
    let dif = localStorage.getItem('Difficult')
    const areaFieldSize = document.getElementById('areaField');
    const panel = document.getElementById('Panel')
    if (dif === 'Easy'){
        areaFieldSize.style.left = '736px'
        areaFieldSize.style.height = '540px'
        areaFieldSize.style.width = '477px'
        panel.style.left = '50px'
    }
    else if(dif === 'Medium'){
        areaFieldSize.style.width = '760px'
        areaFieldSize.style.height = '825px'
        areaFieldSize.style.left = '580px'
        panel.style.left = '190.5px'
    }
    else if(dif === 'Hard'){
        areaFieldSize.style.width = '68.22%'//'1310px'
        areaFieldSize.style.height = '85.56%'//'830px'
        areaFieldSize.style.left = '46'
        panel.style.left = '35.49%'//'465px'
        mainField.style.left = '3.74%'//92
    }
    restartButton.addEventListener('click', restartField)
    for (let cell of document.querySelectorAll('.cell')) {
        cell.addEventListener('click', leftClick);
        cell.addEventListener('contextmenu', rightClick)
    }
    let id = localStorage.getItem('gameId')
    takeOpenCellsInGame('POST', `http://localhost:8888/field?game_id=${id}`)
}

function takeOpenCellsInGame(method, url){
    fetch(url).then(async response => {
        let x = await response.json()
        let open = x.openCells
        let end = x.engGame
        if(end === true){
            openField()
        }
        else{
            openCells(open)
        }
        return x
    })
}

function restartField(){
    let stringId = localStorage.getItem('gameId')
    let id = Number(stringId)
    const URL = "http://localhost:8888/generateGameId"
    let q = {"Difficult" :localStorage.getItem('Difficult')};
    let x = JSON.stringify(q)
    sendDifficult(URL, x).then(r => {})
}

const sendDifficult = async (url, data) => {
    const response = await fetch(url, {
        method: 'POST',
        body: data
    })

    if(!response.ok){
        throw new Error(`Ошибка при запросе адресса ${url}, статус ошибки: ${response}`);
    }
    else{
        let raw = await response.json();
        localStorage.setItem('gameId', raw.gameId)
        console.log(raw);
        document.location.href = "http://localhost:8888/start";
        return response;
    }
}

const leftClick = (event) => {
    let id = event.target.id
    if(startTimer === 0){
        startTimer = 1
        timerId = setInterval(timer, 1000);
    }
    getTurnParametrs(id)
}

document.oncontextmenu = () => {
    return false;
}

function rightClick(id){
    const cell = document.getElementById(`${id.target.id}`)
    //cell.classList.remove("notOpen")
    //cell.classList.add("flagRubanov")
    //cell.background = "url('./img/flagRubanov.png')"
    //cell.classList.add("notOpen")
}


function getTurnParametrs(id){
    let height = field.length - 2
    let width = field[0].length - 2
    let size = height * width
    let x = 0, y = 0
    if(width === 30) {
        x = Math.floor((id - 1) / width) + 1
        y = (id % width) + (x - 1) * width
        if (id % width === 0) {
            y += width
        }
        y -= (x - 1) * width
    }
    else{
        x = Math.floor((id - 1) / width) + 1;
        y = id - (x - 1) * width;
    }
    let game_id = localStorage.getItem('gameId')
    turn('GET', turnURL + `?game_id=${game_id}&x=${x}&y=${y}`)
}


function openField(){
    for(let i = 1; i <= fieldHeight; i++){
        for(let j = 1; j <= fieldWidth; j++){
            let id = (i - 1) * fieldWidth + j
            const cell = document.getElementById(`${id}`)
            cell.classList.remove("notOpen");
        }
    }
}

function turn(method, url){
    fetch(url).then(async response => {
        let x = await response.json()
        turn_open_cells = x.open_cells
        let endgame = x.endGame
        if(endgame === true){
            openField();
            return x;
        }
        openCells(turn_open_cells)
        //console.log(x)
        return x
    })
}

function openCells(open_cells){
    let x, y, q, id
    for(let i = 0; i < open_cells.length; i++){
        x = open_cells[i][0]
        y = open_cells[i][1]
        q = open_cells[i][2]
        id = (x - 1) * fieldWidth + y
        const cell = document.getElementById(`${id}`)
        if(cell !== null && cell.classList.contains('notOpen') === true) {
            cell.classList.remove("notOpen");
        }
    }
    if(fieldWidth * fieldHeight === open_cells.length){
        endGame()
    }
}

let anim
saveTimer = 0
checkEndGame = 0
function endGame(){
    timer = document.getElementById('Timer')
    if(checkEndGame === 0) {
        checkEndGame = 1
        saveTimer = timer.innerHTML
        anim = setInterval(timerAnimation, 150);
    }
    clearTimeout(timerId);
    //console.log('Вы не выйграли')
}

col = 0
function timerAnimation(){
    timer.innerHTML = `${col}${col}${col}`
    if(col === 9) {
        clearTimeout(anim)
        timer.innerHTML = saveTimer
    }
    col++
}

const getFieldById = async (url, data) => {
    const response = await fetch(url, {
        method: 'POST',
        body: data
    })

    if(!response.ok){
        throw new Error(`Ошибка при запросе адресса ${url}, статус ошибки: ${response}`);
    }
    else{
        let raw = await response.json();
        field = raw.field
        printField()
        return raw
    }
}

function takeField(){
    let x = localStorage.getItem('gameId')
    let q = {"ID": x};
    getFieldById(fieldURL, JSON.stringify(q)).then(r => {})
}

takeField()

let timerId
time = 0
startTimer = 0
function timer(){
    timer = document.getElementById('Timer')
    time++;
    let s = ''
    if(time === 999){
        clearTimeout(timerId);
    }
    if(Math.floor(time / 10) === 0){
        s = `00${time}`
    }
    else if(Math.floor(time / 100) === 0){
        s = `0${time}`
    }
    else{
        s = `${time}`
    }
    timer.innerHTML = s
}











/*   Переписал на сервер
// Получаем рандомные x и y от 1 до (x, y)
function getRandomXY(x, y) {
    return [Math.floor(Math.random() * x) + 1, Math.floor(Math.random() * y) + 1];
}

//Проверка количества мин в мапе
function checkMinesCol(x, y, mines, mp) {
    let arr = [];
    for(let i = 0; i <= x + 1; i++) {
        arr.push([])
        for (let j = 0; j <= y + 1; j++) {
            arr[i][j] = 0;
        }
    }
    let sum = 0;
    for (let it of mp.keys()) {
        if(arr[it[0]][it[1]] !== -1) {
            arr[it[0]][it[1]] = -1;
            sum++;
        }
    }
    return sum !== mines;
}

//Генерируем координаты мин
function takeMinesCord(x, y, mines){
    let mp = new Map();
    let q;
    while(checkMinesCol(x, y, mines, mp)){//!!! Не делать проверку через размер мапа, ключи могут быть одинаковыми
       do {
            q = getRandomXY(x, y);
       } while(mp.get(q) === -1);
       mp.set(q, -1);
    }
    return mp;
}

//Открываем пустые клетки после клика
function openNearCells(x, y){

}

// Расставляем числа около мин
function putNumbersAroundMine(x, y, mainField){
    for(let i = 1; i <= x; i++){
        for(let j = 1; j <= y; j++){
            let q = 0;
            if(mainField[i][j] !== -1){
                if(mainField[i + 1][j] === -1) q++;
                if(mainField[i - 1][j] === -1) q++;
                if(mainField[i][j + 1] === -1) q++;
                if(mainField[i][j - 1] === -1) q++;
                if(mainField[i - 1][j + 1] === -1) q++;
                if(mainField[i - 1][j - 1] === -1) q++;
                if(mainField[i + 1][j + 1] === -1) q++;
                if(mainField[i + 1][j - 1] === -1) q++;
                mainField[i][j] = q;
            }
        }
    }
}

//Основная функция
function generateField(x, y, mines){
    let mainField = []; // Поле с минами и числами около них
    let openCells = []; // Поле со статусом открытых/закрытых клеток
    for(let i = 0; i <= x + 1; i++) {
        mainField.push([])
        openCells.push([]) // Обьявляем массивы
        for (let j = 0; j <= y + 1; j++) {
            mainField[i][j] = 0;
            openCells[i][j] = 0;
        }
    }
    let minesCord = takeMinesCord(x, y, mines); // Получаем мап координат
    //console.log(minesCord);
    //console.log(x, y);
    for (let it of minesCord.keys()) {
        mainField[it[0]][it[1]] = -1;     // Расставляем мины в основном поле
    }
    putNumbersAroundMine(x, y, mainField) // Расставляем числа около мин

    //Дебаг
    let sum = 0;
    for(let i = 1; i <= x; i++){
        for(let j = 1; j <= y; j++){
            if(mainField[i][j] == -1) sum++;
        }
    }
    console.log(sum)
    for(let i = 0; i <= x + 1; i++) {
       // console.log(i, ':', mainField[i])
    }
}

function Start(){
    let raw = localStorage.getItem('Difficult')
    console.log(raw)
}

Start()
*/
// 9 * 9 - 10    8.1 (Клеток на 1 мину)
// 16 * 16 - 40  6.4
// 16 * 30 - 99  4.84