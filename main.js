//classes
class gameContainer {
    constructor() {
        this.player = null;
        this.drops = [];
        this.element = document.createElement('div');
        this.element.classList.add('game-screen__side');
        gameData.screenElement.append(this.element);
    }

    removeOldDrops() {
        this.drops.forEach(drop => {
            if (drop.parentElement.getBoundingClientRect().bottom < drop.element.getBoundingClientRect().top) {
                //drop is below screen
                //remove html from DOM
                drop.element.remove();
                //remove object from drops list
                this.drops.splice(this.drops.indexOf(drop), 1);
            }
        });
    }
}

class Drop {
    constructor(column, speed, parentElement) {
        this.column = column;
        this.speed = speed;
        this.yPosition = 0;
        this.parentElement = parentElement;
    }

    createHTML() {
        this.element = document.createElement('div');
        this.element.classList.add('game-screen__drop');
        this.element.style.transition = `all ${gameData.animationDuration}s linear 0s`;
        //if column is 2, push to the right
        if (this.column === 2) this.element.style.left = '20vw';
        this.parentElement.append(this.element);
    }

    updatePosition() {
        this.yPosition += this.speed;
        this.element.style.top = `${this.yPosition}px`;
    }

    checkCollision(elementToCollide) {
        let dropRect = this.element.getBoundingClientRect();
        let elementRect = elementToCollide.getBoundingClientRect();

        if (dropRect.bottom > elementRect.top && dropRect.top < elementRect.bottom && dropRect.left < elementRect.right && dropRect.right > elementRect.left) {
            //end game
            gameData.endGame();
        }
    }
}

class Player {
    constructor(parent, column, moveKey) {
        this.column = column;
        this.parentElement = parent;
        this.moveKey = moveKey;
    }

    createHTML() {
        this.element = document.createElement('div');
        this.element.classList.add('game-screen__player');
        this.element.style.transition = `all ${gameData.moveTime}s linear 0s`
        this.parentElement.append(this.element);
    }

    move() {
        if (this.column === 1) {
            this.element.style.left = '20vw';
            setTimeout(() => {
                this.column = 2
            }, this.moveTime * 1000)
        } else if (this.column === 2) {
            this.element.style.left = '0vw';
            setTimeout(() => {
                this.column = 1
            }, this.moveTime * 1000)
        }
    }
}




//setup game

const gameData = {

    screenElement: document.querySelector('.game-screen'),
    //populate from start screen when added

    //keys to control each section
    controlKeys: ['ArrowLeft', 'ArrowRight'],
    //time for drop to go from top to bottom of screen - independent of reolution (s)
    timeToDrop: 2,
    //time to move player across screen (s)
    moveTime: 0.3,
    //frame time (s)
    animationDuration: 0.05,
    //pixels per frame - calculated on game start
    dropSpeed: null,

    containers: [],
    players: [],
    drops: [],
    dropGap: window.innerHeight * 0.15,
    playing: true,

    startGame: function () {

        //calculate drop speed
        this.dropSpeed = this.screenElement.clientHeight/(this.timeToDrop/this.animationDuration);
        
        //create 2 new containers
        for (let index = 0; index < 2; index++) {
            this.containers.push(new gameContainer());
        }

        this.containers.forEach((container, index) => {
            container.player = new Player(container.element, 1, this.controlKeys[index]);
            container.drops.push(new Drop(Math.ceil(Math.random() * 2), gameData.dropSpeed, container.element));
            container.player.createHTML();
            container.drops.forEach(drop => {
                drop.createHTML()
            });
        });

        document.addEventListener('keydown', (e) => {
            this.containers.forEach(container => {
                if (e.key === container.player.moveKey) {
                    container.player.move();
                }
            });
        })

        gameData.playing = true;

        setTimeout(()=>{this.runGame()},2000);
    },

    runGame: function () {
        if (gameData.playing) {
            //run function again, for 60fps
            setTimeout(() => {
                this.runGame()
            }, this.animationDuration*1000);

            this.containers.forEach(container => {
                container.drops.forEach(drop => {
                    //update drop position
                    drop.updatePosition();
                    //check collision and end game if player has collided with drop
                    drop.checkCollision(container.player.element)
                })
                container.removeOldDrops();
            })


            // for each container, check if more drops need to be created - if every drop is below the top of the screen by the drop gap amount
            this.containers.forEach(container => {
                if (container.drops.every(drop => drop.element.getBoundingClientRect().top > drop.parentElement.getBoundingClientRect().top + this.dropGap)) {
                    newDrop = new Drop(Math.ceil(Math.random() * 2), this.dropSpeed, container.element);
                    newDrop.createHTML();
                    container.drops.push(newDrop);
                }
            });
        }
    },

    endGame: function () {
        this.playing = false;
        //to end game screen
    }

};

//show start screen

//on click
gameData.startGame();