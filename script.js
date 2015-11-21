var stage = new PIXI.Container(), score_text,
    renderer = PIXI.autoDetectRenderer(500, 800), bossFire, spawn_interval, gameStarted = false, st, help_button, credit, help_text, start_button, shoot_sound, explosion_sound,
    spaceship, state, rocket, inState = [], rocketSpeed = 6, arrayRocket = [], arrayEnemy = [], rocketEnemy = [], canGoRight, nbEnemyRocket = 0, canBossFire = false, interval_boss_fire,
    nbRocket = 0, nbEnemy = 0, canHit = true, canFire = true, health = 3, damage = false, heal_text, score = 0, is_gameover = false, boss, level = [], my_level = 0, canGetDamage = true,
    level_duration, level_enemy, level_bossHP, boss_HP;
document.body.appendChild(renderer.view);

var Bullets = new PIXI.Container(),
    EnemyBullets = new PIXI.Container(),
    Ennemies = new PIXI.Container();


function reload() {
    "use strict";
    location.reload();
}

function help_menu() {
    "use strict";
    var help = new PIXI.Text("HELP", {
        font: "bold 50px Arial",
        fill: "#ffffff",
        align: 'center'
    });
    help.x = 180;
    help.y = 250;

    var credit_help = new PIXI.Text("Developed by Raphaël BLEUZET\nSprite by MillionthVector",
    {
        font: "14px Arial",
        fill: "#ffffff"
    });
    credit_help.y = 760;
    credit_help.x = 10;

    var move_help = new PIXI.Text("Use arrow key for move and space for fire",
    {
        font: "24px Arial",
        fill: '#ffffff'
    });
    move_help.y = 450;
    move_help.x = 25;

    var return_start = new PIXI.Text("Return to start",
    {
        font: "24px Arial",
        fill: "#ffffff"
    });
    return_start.interactive = true; // Clickable button
    return_start.on('click', reload);
    return_start.x = 330;
    return_start.y = 5;

    stage.addChild(return_start);
    stage.addChild(move_help);
    stage.addChild(credit_help);
    stage.addChild(help);

    stage.removeChild(help_button);
    stage.removeChild(credit);
    stage.removeChild(help_text);
    stage.removeChild(start_button);

    renderer.render(stage);
}

$.ajax({
    url: 'level.json',
    dataType: 'json',
    complete: function(data) {
        level = data.responseJSON.level;
        start();
    },
    error: function (data, status, error) {
        console.log('load json fail');
        console.log(data);
        console.log(status);
        console.log(error);
    }
});

function nextLevel() {
    "use strict";
    st = 'next';
    if (my_level + 1 == level.length) {
        gameOver();
    } else {
        var win_text = new PIXI.Text("YOU WIN !!!\nGet ready for next level",
        {
            font: 'bold 40px Arial',
            fill: '#cc00ff',
            align: 'center',
            stroke: '#FFFFFF',
            strokeThickness: 6
        });
        win_text.y = 300;
        win_text.x = 20;

        clearInterval(bossFire);
        clearInterval(spawn_interval);
        stage.addChild(win_text);
        my_level = my_level + 1;
        setTimeout(function () {
            /* clear var */
            spaceship = "";
            for (var i = 0; i < Ennemies.children.length; i++) {
                Ennemies.removeChild(Ennemies.children[i]);
            }
            arrayEnemy = [];
            nbEnemy = 0;
            canHit = true;
            canFire = true;
            damage = false;
            loadLevel();
        }, 5000);
    }
}

var Boss = function () {
    "use strict";
    return new PIXI.Sprite(PIXI.loader.resources.boss.texture);
}

var Hit = function () {
    "use strict";
};
Hit.prototype = {
    boss: function () {
        if (canHit == true) {
            canHit = false;
            var texture01 = PIXI.Texture.fromFrame('img/boss.png');
            var texture02 = PIXI.Texture.fromFrame('img/boss-touch.png');
            var explosion = PIXI.Texture.fromFrame('img/explosion.png');
            console.log('hit boss texture');
            if (boss_HP <= 0) {
                boss.texture = explosion;
                score = score + 50;
                nextLevel();
            } else {
                var i = 0;
                boss.texture = texture02;
                boss_HP = boss_HP - 1;
                setTimeout(function () {
                    boss.texture = texture01;
                    canHit = true;
                }, 500);
            }
        }
    },
    enemy: function (enemy, i) {
        var explosion = PIXI.Texture.fromFrame('img/explosion.png');

        enemy.texture = explosion;
        setTimeout(function () {
            Ennemies.removeChild(enemy);
            arrayEnemy[i] = "";
            score = score + 1;
        }, 200);

    }
}
var hit = new Hit();
// The spaceship
var SpaceShip = function () {};
SpaceShip.prototype = {
    speed: 4 + my_level,
    vx: 0,
    vy: 0,
    x: 0,
    y: 0,
    moveLeft: function () {
        spaceship.vx = -this.speed;
    },
    moveRight: function () {
        spaceship.vx = +this.speed;
    },
    moveUp: function () {
        spaceship.vy = -this.speed;
    },
    moveDown: function () {
        spaceship.vy = +this.speed;
    },
    stop: function () {
        spaceship.vy = 0;
        spaceship.vx = 0;
        canFire = true;
    },
    fire: function () {
        if (canFire == true) {
            shoot_sound.play();
            canFire = false;
            arrayRocket[nbRocket] = new Bullet();
            arrayRocket[nbRocket].x = spaceship.x - 10;
            arrayRocket[nbRocket].y = spaceship.y - 30;
            arrayRocket[nbRocket].anchor.x = 0.5;
            arrayRocket[nbRocket].anchor.y = 0.5;
            Bullets.addChild(arrayRocket[nbRocket]);
            stage.addChild(Bullets);
            nbRocket += 1;

            arrayRocket[nbRocket] = new Bullet();
            arrayRocket[nbRocket].x = spaceship.x + 10;
            arrayRocket[nbRocket].y = spaceship.y - 30;
            arrayRocket[nbRocket].anchor.x = 0.5;
            arrayRocket[nbRocket].anchor.y = 0.5;
            Bullets.addChild(arrayRocket[nbRocket]);
            stage.addChild(Bullets);
            nbRocket += 1;
        }
    }
}

var Keyboard = function () {};
Keyboard.prototype = {
    down: function (e) {
        if (st == 'render') {
            if (e.keyCode == 37) {
                ship.moveLeft();
            }
            if (e.keyCode == 38) {
                ship.moveUp();
            }
            if (e.keyCode == 39) {
                ship.moveRight();
            }
            if (e.keyCode == 40) {
                ship.moveDown();
            }
            if (e.keyCode == 32) {
                ship.fire();
            }
        }
    },
    up: function () {
        ship.stop();
    }

}

var Bullet = function () {
    return new PIXI.Sprite(PIXI.loader.resources.rocket.texture);
}
// Game start menu
function start() {
    console.log(level.length);
    st = 'start';
    start_button = new PIXI.Text('START !', {
        font : '36px Arial',
        fill : '#FFFFFF',
    });
    start_button.interactive = true; // Clickable button
    start_button.on('click', load);
    start_button.y = 400;
    start_button.x = 175;

    help_button = new PIXI.Text("HELP !", {
        font : '36px Arial',
        fill : '#FFFFFF',
    });
    help_button.interactive = true; // Clickable button
    help_button.on('click', help_menu);
    help_button.x = 185;
    help_button.y = 500;

    help_text = new PIXI.Text("Use arrow key for move and space for fire", {
        font: "24px Arial",
        fill: '#ffffff'
    });
    help_text.y = 600;
    help_text.x = 25;

    credit = new PIXI.Text("Raphaël BLEUZET", {
        font: "20px Arial",
        fill: "#ffffff"
    });
    credit.y = 770;
    credit.x = 10;

    stage.addChild(help_button);
    stage.addChild(credit);
    stage.addChild(help_text);
    stage.addChild(start_button); // Add start button to stage

    renderer.render(stage);

}

function load () {
    PIXI.loader
    .add("space", "img/space.png")
    .add('spaceship', 'img/spaceship.png')
    .add('rocket', 'img/rocket.png')
    .add('boss', 'img/boss.png')
    .add('enemy', 'img/enemy.png')
    .add('boss-touch', 'img/boss-touch.png')
    .add('explosion', 'img/explosion.png')
    .add('level', 'level.json')
    .on('progress', function() {
        console.log('loading');
    })
    .load(loadLevel);
}

function loadLevel () {
    help_button.interactive = false;
    level_duration = level[my_level].duration;
    level_enemy = level[my_level].enemy;
    level_bossHP = level[my_level].bossHP;
    boss_HP = level[my_level].bossHP;
    interval_boss_fire = eval(1000 / level[my_level].rocketsPerSeconde);
    game();
}

function game () {
    shoot_sound = new Howl({
        urls: ['sound/shoot.mp3'],
        volume: 1
    });
    explosion_sound = new Howl({
        urls: ['sound/explosion.mp3'],
        volume: 1
    });
    ship = new SpaceShip();
    key = new Keyboard();
    window.addEventListener("keydown", key.down);
    window.addEventListener("keyup", key.up);
    canGoRight = true;
    state = render;
    st = 'render';
    spaceship = new PIXI.Sprite(PIXI.loader.resources.spaceship.texture);
    stage.addChild(new PIXI.Sprite(PIXI.loader.resources.space.texture));
    stage.addChild(spaceship);
    spaceship.vx = 0;
    spaceship.vy = 0;
    spaceship.x = 200;
    spaceship.y = 730;
    spaceship.anchor.x = 0.5;
    spaceship.anchor.y = 0.5;
    inState.push('spaceship');
    if (gameStarted == false) {
        LoopUpdate();
        gameStarted = true;
    }
    life();
    var enemy_spawn = 0;
    var enemy_interval = eval((level_duration) / level_enemy);
    spawn_interval = setInterval(function () {
        if (enemy_spawn <= level_enemy) {
            createEnemy();
            enemy_spawn = enemy_spawn + 1;
        } else {
            clearInterval(spawn_interval);
        }
    }, enemy_interval);
    setTimeout(function () {
        createBoss();
    }, level_duration);

    var showLevel = new PIXI.Text("LEVEL " + (my_level + 1), {
        font: "bold 30px Arial",
        fill: '#ffffff'
    });
    showLevel.y = 400;
    showLevel.x = 175;
    stage.addChild(showLevel);

    setTimeout(function () {
        stage.removeChild(showLevel);
    }, 1000)
}

function LoopUpdate(){
    /* loop 60 fps */
    requestAnimationFrame(LoopUpdate);
    state();
    renderer.render(stage);
}

function render() {
    if (st == 'render') {
        var hitted = false;
        /* Deplacement spaceship */
        if (inState.indexOf("spaceship") != -1) {
            if (spaceship.x + spaceship.vx > 20 && spaceship.x + spaceship.vx < 477) {
                spaceship.x += spaceship.vx;
            }
            if (spaceship.y + spaceship.vy < 746 && spaceship.y + spaceship.vy > 0) {
                spaceship.y += spaceship.vy;
            }
        }
        /* My rocket hit */
        if (arrayRocket.length != 0) {
            for (var i = arrayRocket.length - 1; i >= 0; i--) {
                arrayRocket[i].y -= 10 + my_level;
                /* hit boss */

                if (boss !== undefined) {

                    if (hitTest(arrayRocket[i], boss)) {
                        hitted = true;
                        Bullets.removeChild(arrayRocket[i]);
                        delete(arrayRocket.i);
                        hit.boss();
                    }
                }

                /* enemy hit */
                if (arrayEnemy.length != 0) {
                    for (var j = 0; j < arrayEnemy.length; j++) {
                        if (arrayEnemy[j] != "") {
                            if (hitTest(arrayRocket[i], arrayEnemy[j])) {
                                hit.enemy(arrayEnemy[j], j);
                                //explosion_sound.play();
                            }
                        }
                    }
                }

                if (arrayRocket[i].y < -50) {
                    Bullets.removeChild(arrayRocket[i]);
                }
            };
        }

        /* Enemy move */
        if (arrayEnemy.length != 0) {
            for (var i = 0; i < arrayEnemy.length; i++) {
                if (arrayEnemy[i] != "") {
                    /* delete enemy */
                    if (arrayEnemy[i].y > 830 && canGetDamage == true) {
                        canGetDamage = false;
                        arrayEnemy[i] = "";
                        getDamage();
                    }
                    arrayEnemy[i].y += 2;
                }
            }
        }


        /* Enemy hit */
        if (arrayEnemy.length != 0) {
            for (var i = 0; i < arrayEnemy.length; i++) {
                if (arrayEnemy[i] != "") {
                    if (hitTest(spaceship, arrayEnemy[i]) && canGetDamage == true) {
                        console.log('a');
                        canGetDamage = false;
                        hit.enemy(arrayEnemy[i], i);
                        getDamage();
                    }
                }
            };
        }

        /* enemy rocket hit me */
        if (rocketEnemy.length != 0) {
            for (var i = 0; i < rocketEnemy.length; i++) {
                if (rocketEnemy[i] != "") {
                    if (hitTest(rocketEnemy[i], spaceship)) {
                        getDamage();
                        EnemyBullets.removeChild(rocketEnemy[i]);
                        rocketEnemy[i] = "";
                    }
                }
            }
        }


        /* hit rocket / rocket */
/*      if (rocketEnemy.length != 0 && arrayRocket.length != 0) {
            for (var r = 0; r < arrayRocket.length; r++) {
                if (arrayRocket[r] != "") {
                    for (var rE = 0; rE < rocketEnemy.length; rE++) {
                        if (rocketEnemy != "") {
                            if (hitTest(rocketEnemy, arrayRocket)) {
                                EnemyBullets.removeChild(rocketEnemy[rE]);
                                rocketEnemy[rE] = "";
                                Bullets.removeChild(arrayRocket[r]);
                                arrayRocket[r] = ""
                            }
                        }
                    };
                }
            };
        }*/

        /* boss rocket move */
        if (rocketEnemy.length != 0) {
            for (var i = 0; i < rocketEnemy.length; i++) {
                if (rocketEnemy[i] != "") {
                    /* remove bullet */
                    if (rocketEnemy[i].y > 850) {
                        EnemyBullets.removeChild(arrayRocket[i]);
                        rocketEnemy[i] = "";
                    }

                    /* move */
                    rocketEnemy[i].y = rocketEnemy[i].y + 7;
                }
            }
        }


        /* boss move */
        if (boss !== undefined) {
            /* pop */
            if (boss.y < 20) {
                boss.y = boss.y + 1;
            }
            if (boss.x > 390) {
                canGoRight = false;
            }
            if (boss.x < 1) {
                canGoRight = true;
            }
            if (boss.y >= 20 && canBossFire == false) {
                canBossFire = true;
            }
            /* right left */
            if (boss.y >= 20 && canGoRight == true) {
                boss.x = boss.x + 3;
            }
            if (boss.y >= 20 && canGoRight == false) {
                boss.x = boss.x - 3;
            }
        }

        /* boss fire */

    }

    if (health <= 0 && is_gameover == false) {
        gameOver();
    }
}

function createBoss() {
    boss = new Boss();
    stage.addChild(boss);
    boss.y = -200;
    boss.x = 1;
    bossFire = setInterval(function () {
        if (boss.y >= 20 && st == 'render') {
            createEnemyRocket();
            shoot_sound.play();
        }
    }, interval_boss_fire);
}
function createEnemy () {
    if (st = 'render') {
        arrayEnemy[nbEnemy] = new PIXI.Sprite(PIXI.loader.resources.enemy.texture);
        arrayEnemy[nbEnemy].x = Math.floor((Math.random() * 450) + 1);
        arrayEnemy[nbEnemy].y = -40;
        arrayEnemy[nbEnemy].anchor.x = 0.5;
        arrayEnemy[nbEnemy].anchor.y = 0.5;
        Ennemies.addChild(arrayEnemy[nbEnemy]);
        stage.addChild(Ennemies);
        nbEnemy += 1;
    }
}

function getDamage() {
    health -= 1;
    life();
    setTimeout(function () {
        canGetDamage = true;
    }, 250);
}

function createEnemyRocket() {
    rocketEnemy[nbEnemyRocket] = new Bullet();
    rocketEnemy[nbEnemyRocket].rotation = (Math.PI);
    rocketEnemy[nbEnemyRocket].x = boss.x + 65;
    rocketEnemy[nbEnemyRocket].y = boss.y + 220;
    EnemyBullets.addChild(rocketEnemy[nbEnemyRocket]);
    stage.addChild(EnemyBullets);
    nbEnemyRocket += 1;
}
function life() {
    if (health < 3) {
        heal_text.text = "Heal : " + health;
    } else {
        heal_text = new PIXI.Text("Heal : " + health, {
            font: "30px Arial",
            fill: '#ffffff'
        });
        heal_text.x = 350;
        stage.addChild(heal_text);
    }
}

function score() {

}

function stop() {}

function gameOver() {
    var explosion = PIXI.Texture.fromFrame('img/explosion.png');
    state = stop;
    spaceship.texture = explosion;
    explosion_sound.play();
    st = "gameover";
    is_gameover = true;
    var gameover_text = new PIXI.Text("Game Over\nScore : " + score, {
        font: "40px Arial",
        fill: '#ff0000',
        align: 'center',
        dropShadow: 'true',
        dropShadowColor: '#000000'
    });
    gameover_text.y = 300;
    gameover_text.x = 150;

    var replay = new PIXI.Text("REPLAY", {
        font: "bold 40px Arial",
        fill: '#f456f4',
        align: 'center',
        stroke: '#ab42d4',
        strokeThickness: 6
    });

    replay.interactive = true; // Clickable button
    replay.on('click', reload);
    replay.y = 400;
    replay.x = 180;
    stage.addChild(replay);
    stage.addChild(gameover_text);
    renderer.render(stage);
}

function hitTest(o1, o2) {
    return !(o2.x > (o1.x + o1.width) || (o2.x + o2.width) < o1.x || o2.y > (o1.y + o1.height) || (o2.y + o2.height) < o1.y);
}