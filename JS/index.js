const GAME_STATE_ACTIVE = "active";
const GAME_STATE_OVER = "over";
let GAME_STATE = GAME_STATE_ACTIVE;
let enemyz = [];
let enemyzCondition = new Map();
const ENEMY_DEAD = "dead";
const ENEMY_ALIVE = "alive";
let shipLeft = 0;
const endBoom = new Audio('./audio/endBoom.mp4');
const killEnemy = new Audio('./audio/killEnemy.mp4');
const schoolInToronto = new Audio('./audio/schoolInToronto.mp4');
let currentScore = 0;
let maxScore = 0;
let coolDown = 1;
let waves = 1000;
let numberWaves = 0;
let lastShotTime = 0;

let runNum = 1;
let enemyNum = 1;



function getBattlefield(){
    return document.getElementById("outside-spaceship")
}

async function newGame() {
    if (GAME_STATE === GAME_STATE_OVER) {
        document.getElementById("score").innerHTML = "score: " + currentScore;
        getBattlefield().innerHTML = "";
        GAME_STATE = GAME_STATE_ACTIVE;
        document.getElementById("startButton").style.visibility = "hidden";
        numberWaves = 0;
        waves = 1000;
        enemyz = [];
        enemyzCondition = new Map();
        runNum++;
        enemyNum = 1;
        await createAllWaves();
    }
}

async function shoot() {

    const now = Date.now();
    if (now - lastShotTime < 400) {
        return;
    }

    lastShotTime = now;


    let bullet = document.createElement("img");
    bullet.src = "images/fireball.png";
    bullet.classList.add("bullet");
    getBattlefield().appendChild(bullet);
    let bulletLeft = document.getElementById('spaceship').getBoundingClientRect().left;
    bullet.style.left = bulletLeft + "px";
    let bulletTop = document.getElementById('spaceship').getBoundingClientRect().top;
    for (let times = 200; times > 0; times = times - 1) {
        await new Promise(r => setTimeout(r, 20));
        bulletTop = bulletTop - 5;
        bullet.style.top = bulletTop + 'px';

        for (let times = 0; GAME_STATE === GAME_STATE_ACTIVE && times < enemyz.length; times++) {
            let enemyTop = enemyz[times].getBoundingClientRect().top;
            let enemyBottom = enemyz[times].getBoundingClientRect().bottom;
            let enemyLeft = enemyz[times].getBoundingClientRect().left;
            let enemyRight = enemyz[times].getBoundingClientRect().right;
            let bulliTop = bullet.getBoundingClientRect().top;
            let bulliLeft = bullet.getBoundingClientRect().left;


            if (bulliTop >= enemyTop && bulliTop <= enemyBottom && bulliLeft > enemyLeft && bulliLeft < enemyRight) {
                enemyzCondition.set(enemyz[times], ENEMY_DEAD);
                currentScore = currentScore + 100;
                bullet.remove();
                bulliLeft = 10000000;
                document.getElementById("score").textContent = "score:" + currentScore;
                if (currentScore > maxScore) {
                    maxScore = currentScore;
                    document.getElementById("maxscore").textContent = "best: " + maxScore;
                }
                let miniBoom = document.createElement("img");
                miniBoom.src = "images/miniboom.png";
                getBattlefield().appendChild(miniBoom);
                miniBoom.style.width = 100 + "px";
                miniBoom.style.height = 100 + "px";
                miniBoom.style.zIndex = "10000";
                miniBoom.style.position = "absolute";
                miniBoom.style.left = enemyLeft;
                miniBoom.style.top = enemyTop;
                bullet.remove();
                setTimeout(() => {
                    miniBoom.remove();
                }, 1000);
                break;
            }
        }

    }
}

document.addEventListener("keydown", event => saveKey(event));
document.addEventListener("keyup", event => saveKey(event));

let isKeyPressed = new Map();

function saveKey(event) {
    isKeyPressed.set(event.code, event.type === 'keydown');
}

function moveShip() {
    if (GAME_STATE !== GAME_STATE_ACTIVE) {
        return;
    }

    const spaceshipObj = document.getElementById('spaceship');
    if (shipLeft === 0) {
        shipLeft = spaceshipObj.getBoundingClientRect().left;
    }
    if (isKeyPressed.get("ArrowLeft")) {

        shipLeft = shipLeft - 10;

        spaceshipObj.style.left = shipLeft + 'px';

    }
    if (isKeyPressed.get("ArrowRight")) {

        shipLeft = shipLeft + 10;
        spaceshipObj.style.left = shipLeft + 'px';

    }
    if (isKeyPressed.get("Space") && coolDown === 1) {
        coolDown = 0;
        shoot();
        schoolInToronto.play();
        setTimeout(coolDown = 1, 2000)

    }
    if (shipLeft <= 617) {
        shipLeft = shipLeft + 10;
    }

    if (shipLeft >= 1360) {
        shipLeft = shipLeft - 10
    }

}


async function gameOver() {
    GAME_STATE = GAME_STATE_OVER;
    currentScore = 0;
    enemyz = [];
    enemyzCondition = new Map();
    await endBoom.play();
    let boom = document.createElement("img");
    boom.src = "https://img.gazeta.ru/files3/716/15297716/RDS-6s_ognennoe_oblako-pic_32ratio_900x600-900x600-59269.jpg";
    getBattlefield().appendChild(boom);
    boom.style.width = 100 + "%";
    boom.style.height = 100 + "%";
    boom.style.zIndex = "10000";
    boom.style.position = "relative";
    boom.style.left = "0";
    document.getElementById("startButton").style.visibility = "visible";
}

async function moveEnemyDown(enemy) {
    let enemyTop = enemy.getBoundingClientRect().top;
    for (let times = 400; GAME_STATE === GAME_STATE_ACTIVE && times > 0; times = times - 1) {
        if(isGameOver()) return;

        await new Promise(r => setTimeout(r, 20));

        enemyTop = enemyTop + 2;
        enemy.style.top = enemyTop + 'px';

        if (enemyzCondition.get(enemy) === ENEMY_DEAD) {
            await killEnemy.play();
            enemy.remove();
            break;
        }

        if (enemyTop >= 680 && GAME_STATE === GAME_STATE_ACTIVE) {
            await gameOver();
        }
    }
}

function createEnemy(offset = 900) {
    let enemy = document.createElement("img");
    enemy.id = `${runNum}_${enemyNum++}`;
    enemy.src = "images/enemy.png";
    enemy.classList.add("enemy");
    getBattlefield().appendChild(enemy);
    let enemyLeft = enemy.getBoundingClientRect().left + offset;
    enemy.style.left = enemyLeft + "px";
    return enemy;
}


function addEnemy(times) {
    let enemy = createEnemy(200 * times + 60);
    enemyz.push(enemy);
    enemyzCondition.set(enemy, ENEMY_ALIVE);
    return enemy;
}

function isGameOver() {
    return GAME_STATE === GAME_STATE_OVER;
}

async function createWaves() {
    for (let i = 0; GAME_STATE === GAME_STATE_ACTIVE && i < 10; i++) {
        for (let times = 0; GAME_STATE === GAME_STATE_ACTIVE && times < 4; times++) {
            if (isGameOver()) {
                return;
            }
            let enemy = addEnemy(times);
            moveEnemyDown(enemy);
            await new Promise(r => setTimeout(r, waves));
        }
        for (let timez = 3; GAME_STATE === GAME_STATE_ACTIVE && timez >= 0; timez--) {
            if (isGameOver()) {
                return;
            }
            let enemy = addEnemy(timez);
            moveEnemyDown(enemy);
            await new Promise(r => setTimeout(r, waves));
        }
    }
}

async function createDoubleWaves() {
    if (GAME_STATE === GAME_STATE_ACTIVE) {
        if (isGameOver()) {
            return;
        }
        let promise1 = createWaves();
        await new Promise(r => setTimeout(r, 1000));
        let promise2 = createWaves();
        return Promise.all([promise1, promise2]);
    }
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


async function createRandomWaves(howMany) {
    for (let times = 1; GAME_STATE === GAME_STATE_ACTIVE && times <= howMany; times++) {
        if (isGameOver()) {
            return;
        }
        let enemy = addEnemy(getRandomInt(4));
        moveEnemyDown(enemy);
        await new Promise(r => setTimeout(r, waves));
    }
}

async function createAllWaves() {
    if (GAME_STATE === GAME_STATE_ACTIVE) {
        if (isGameOver()) {
            return;
        }
        await createWaves();
        await createRandomWaves(10);
        await createDoubleWaves();
        createDoubleWaves();
        await createRandomWaves(1000000);

    }
}

async function setupGame() {
    setInterval(moveShip, 30);
    currentScore = 0;
    document.getElementById("score").textContent = "score: " + currentScore;
    await createAllWaves();
}





