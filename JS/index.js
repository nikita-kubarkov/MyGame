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
let cooldown = 1;
let waves = 1000;
let numberWaves = 0;


function changeScore() {
    // document.getElementById("score")["innerHTML"] = "olala";
    // document.getElementById("score").textContent = currentScore;
    document.getElementById("outside-spaceship").innerHTML = "";
}


function suus() {

}


let lastShotTime = 0;

async function shoot() {
    // Весь код функции shoot() здесь

}


async function newGame() {
    if (GAME_STATE === GAME_STATE_OVER) {
        document.getElementById("outside-spaceship").innerHTML = "";
        GAME_STATE = GAME_STATE_ACTIVE;
        document.getElementById("startButton").style.visibility = "hidden";
        numberWaves = 0;
        waves = 1000;
        // setupGame();

        for (let i = 0; i < 10; i++) {
            for (let times = 0; GAME_STATE === GAME_STATE_ACTIVE && times < 4; times++) {
                let enemy = createEnemy(200 * times + 60);
                enemyz.push(enemy);
                enemyzCondition.set(enemy, ENEMY_ALIVE);
                moveEnemyDown(enemy);
                await new Promise(r => setTimeout(r, waves));
            }
        }
        // location.reload();
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
    document.getElementById("outside-spaceship").appendChild(bullet);
    let bulletLeft = document.getElementById('spaceship').getBoundingClientRect().left;
    bullet.style.left = bulletLeft + "px";
    // return bullet;
    let bulletTop = document.getElementById('spaceship').getBoundingClientRect().top;
    for (let times = 200; times > 0; times = times - 1) {
        await new Promise(r => setTimeout(r, 20));
        bulletTop = bulletTop - 5;
        bullet.style.top = bulletTop + 'px';
        //todo

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
                document.getElementById("outside-spaceship").appendChild(miniBoom);
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
    if (shipLeft == 0) {
        shipLeft = spaceshipObj.getBoundingClientRect().left;
    }
    // alert(event.code);
    if (isKeyPressed.get("ArrowLeft")) {

        shipLeft = shipLeft - 10;

        spaceshipObj.style.left = shipLeft + 'px';

    }
    if (isKeyPressed.get("ArrowRight")) {

        shipLeft = shipLeft + 10;
        spaceshipObj.style.left = shipLeft + 'px';

    }
    if (isKeyPressed.get("Space") && cooldown === 1) {
        cooldown = 0;
        shoot();
        schoolInToronto.play();
        setTimeout(cooldown = 1, 2000)

    }

    // todo починить
    if (shipLeft <= 617) {
        shipLeft = shipLeft + 10;
    }

    if (shipLeft >= 1360) {
        shipLeft = shipLeft - 10
    }

}


async function moveEnemyDown(enemy) {
    let enemyTop = enemy.getBoundingClientRect().top;
    for (let times = 400; GAME_STATE === GAME_STATE_ACTIVE && times > 0; times = times - 1) {
        await new Promise(r => setTimeout(r, 20));
        enemyTop = enemyTop + 2;
        enemy.style.top = enemyTop + 'px';

        if (enemyzCondition.get(enemy) === ENEMY_DEAD) {
            await killEnemy.play();
            enemy.remove();
            break;
        }

        if (enemyTop >= 680 && GAME_STATE === GAME_STATE_ACTIVE) {
            GAME_STATE = GAME_STATE_OVER;
            currentScore = 0;
            // document.getElementById("score").innerHTML = "score: 0";
            await endBoom.play();
            let boom = document.createElement("img");
            boom.src = "https://img.gazeta.ru/files3/716/15297716/RDS-6s_ognennoe_oblako-pic_32ratio_900x600-900x600-59269.jpg";
            document.getElementById("outside-spaceship").appendChild(boom);
            boom.style.width = 100 + "%";
            boom.style.height = 100 + "%";
            boom.style.zIndex = "10000";
            boom.style.position = "relative";
            boom.style.left = "0";
            document.getElementById("startButton").style.visibility = "visible";
        }
    }
}

function createEnemy(offset = 900) {
    let enemy = document.createElement("img");
    enemy.src = "images/enemy.png";
    enemy.classList.add("enemy");
    document.getElementById("outside-spaceship").appendChild(enemy);
    let enemyLeft = enemy.getBoundingClientRect().left + offset;
    enemy.style.left = enemyLeft + "px";
    return enemy;
}


async function addEnemy(times) {
    let enemy = createEnemy(200 * times + 60);
    enemyz.push(enemy);
    enemyzCondition.set(enemy, ENEMY_ALIVE);
    moveEnemyDown(enemy);
    await new Promise(r => setTimeout(r, waves));
}

async function createWaves() {
    for (let i = 0; GAME_STATE === GAME_STATE_ACTIVE && i < 10; i++) {
        for (let times = 0; GAME_STATE === GAME_STATE_ACTIVE && times < 4; times++) {
            await addEnemy(times);
        }
        for (let timez = 3; GAME_STATE === GAME_STATE_ACTIVE && timez >= 0; timez--) {
            await addEnemy(timez);
        }
    }
}

async function createDoubleWaves() {
    let promise1 = createWaves();
    await new Promise(r => setTimeout(r, 1000));
    let promise2 = createWaves();

    return Promise.all([promise1, promise2]);
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


async function createRandomWaves(howMany) {
        for (let times = 1; GAME_STATE === GAME_STATE_ACTIVE && times <= howMany; times++) {
            await addEnemy(getRandomInt(4));
        }
}

async function setupGame() {
    setInterval(moveShip, 30);

    currentScore = 0;
    document.getElementById("score").textContent = "score: " + currentScore;

    await createWaves();
    await createRandomWaves(10);
    await createDoubleWaves();
    createDoubleWaves();
    await createRandomWaves(1000000);
}


// Set the date we're counting down to
// var countDownDate = new Date("Jan 5, 2024 15:37:25").getTime();

// Update the count down every 1 second
// var x = setInterval(function() {

// Get today's date and time
// var now = new Date().getTime();

// Find the distance between now and the count down date
// var distance = countDownDate - now;

// // Time calculations for days, hours, minutes and seconds
// var days = Math.floor(distance / (1000 * 60 * 60 * 24));
// var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
// var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
// var seconds = Math.floor((distance % (1000 * 60)) / 1000);
// Display the result in the element with id="demo"

// If the count down is finished, write some text
//     if (distance < 0) {
//         clearInterval(x);
//         document.getElementById("demo").innerHTML = "EXPIRED";
//     }
// }, 1000);











