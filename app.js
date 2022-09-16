//Передаем значения размер поля и количество мин
function changeDifficult(x){
    if(x === 1){
        localStorage.setItem('Difficult', 'Easy')
    }
    if(x === 2){
        localStorage.setItem('Difficult', 'Medium')
    }
    if(x === 3){
        localStorage.setItem('Difficult', 'Hard')
    }
    let q = {"Difficult" :localStorage.getItem('Difficult')};
    sendDifficult(url, JSON.stringify(q)).then(r => {})
    //document.location.href = "http://localhost:8888/start";
}

const url = "http://localhost:8888/generateGameId"

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

/* radio selector
function chooseDifficult(dif){
    if(dif != 2){
        document.querySelector("body > input[type=radio]:nth-child(2)").checked = false;
    }
    if(dif != 4){
        document.querySelector("body > input[type=radio]:nth-child(4)").checked = false;
    }
    if(dif != 6){
        document.querySelector("body > input[type=radio]:nth-child(6)").checked = false;
    }
}

function validDifficult(){
    let a = document.querySelector("body > input[type=radio]:nth-child(2)").checked;
    let b = document.querySelector("body > input[type=radio]:nth-child(4)").checked;
    let c = document.querySelector("body > input[type=radio]:nth-child(6)").checked;
    if(a || b || c){
        submitXY(a, b, c);
    }
}
*/
