//classes
class gameContainer {
    constructor(width) {
        this.player = null;
        this.drops = [];
        this.element = document.createElement('div');
        this.element.classList.add('game-screen__side');
        this.element.style.width = `${width}%`;
        gameData.screenElement.append(this.element);
    }

    removeOldDrops() {
        let dropsDeleted = 0;
        this.drops.forEach(drop => {
            if (drop.parentElement.getBoundingClientRect().bottom < drop.element.getBoundingClientRect().top) {
                //drop is below screen
                //remove html from DOM
                drop.element.remove();
                //remove object from drops list
                this.drops.splice(this.drops.indexOf(drop), 1);
                dropsDeleted++;
            }
        });
        return dropsDeleted;
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
        if (this.column === 2) this.element.style.left = '40%';
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
            elementToCollide.style.left = window.getComputedStyle(elementToCollide).left;
            this.element.style.top = window.getComputedStyle(this.element).top;
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
        this.element.style.transition = `all ${gameData.moveTime}s linear 0s`;
        this.parentElement.append(this.element);
    }

    move() {
        if (this.column === 1) {
            this.element.style.left = '40%';
            setTimeout(() => {this.column = 2}, this.moveTime * 1000);
        } else if (this.column === 2) {
            this.element.style.left = '0%';
            setTimeout(() => {this.column = 1}, this.moveTime * 1000);
        }
    }
}

class menuButton {
    constructor(classes,text,onClick){
        this.classes = classes;
        this.text = text;
        this.onClick = onClick
    }
}




//setup game

const gameData = {

    screenElement: document.querySelector('.game-screen'),

    //populate from start screen when added

    //keys to control each section
    controlKeys: ['ArrowLeft','ArrowRight'],
    //time for drop to go from top to bottom of screen - independent of reolution (s)
    timeToDrop: 2,
    //time to move player across screen (s)
    moveTime: 0.3,
    //frame time (s)
    animationDuration: 0.05,
    //pixels per frame - calculated on game start
    dropSpeed: null,

    containers: [],
    //this should be changed depending on the screen size
    dropGap: window.innerHeight * 0.2,
    playing: true,
    score: undefined,

    startGame: function () {

        //remove previous html
        this.screenElement.innerHTML = '';

        //set score to 0;
        this.score = 0;

        //display score
        this.scoreElement = this.createText('0','span',['game-screen__score']);

        //calculate drop speed
        this.dropSpeed = this.screenElement.clientHeight/(this.timeToDrop/this.animationDuration);
        
        //create new containers based on number of assinged control keys
        this.containers = this.controlKeys.map(() => new gameContainer(100/this.controlKeys.length));

        this.containers.forEach((container, index) => {
            container.player = new Player(container.element, 1, this.controlKeys[index]);
            container.drops.push(new Drop(Math.ceil(Math.random() * 2), gameData.dropSpeed, container.element));
            container.player.createHTML();
            container.drops.forEach(drop => {
                drop.createHTML()
            });
        });

        document.addEventListener('keydown', (e) => {
            if(gameData.playing){
                this.containers.forEach(container => {
                    if (e.key === container.player.moveKey) {
                        container.player.move();
                    }
                });
            }
        });
        
        gameData.playing = true;

        setTimeout(()=>{this.runGame()},1000);
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
                //1 point for every drop dodged by all players
                this.score += container.removeOldDrops()/this.controlKeys.length;
                //update score
                this.scoreElement.innerText = this.score;
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

    endGame: function() {
        this.playing = false;
        
        //some animation??
        //to end game screen
        setTimeout(()=>{this.drawEndGameScreen()},1000);
    },

    drawStartScreen: function(){
        //remove previous html
        this.screenElement.innerHTML = '';

        //create heading
        this.createText('Intersting Game Title','h1',['game-screen__title']);

        //create buttons and add event listeners

        startScreenButtons = [
            new menuButton(['game-screen__button'],'Start Game',gameData.startGame),
            new menuButton(['game-screen__button'],'Instructions',gameData.drawInstructionsScreen),
            new menuButton(['game-screen__button'],'Settings',gameData.drawOptionsScreen)
        ],
        
        this.createButtons(startScreenButtons);

    },

    drawOptionsScreen: function(){
        //to do
        alert('this will open options eventually');
    },

    drawInstructionsScreen: function(){
        alert('this will open instructions eventually');
    },

    drawEndGameScreen: function(){
        this.screenElement.innerHTML = '';
        
        //game over message
        this.createText('Game Over','h1',['game-screen__title']);

        //score
        this.createText(`Score was ${this.score}`,'p',['game-screen__text']);


        //buttons
        endScreenButtons = [
            new menuButton(['game-screen__button'],'Play Again',gameData.startGame),
            new menuButton(['game-screen__button'],'Back to Menu',gameData.drawStartScreen)
        ];

        this.createButtons(endScreenButtons);

    },

    createText: function(text,tag,classList){
        let heading = document.createElement(tag);
        classList.forEach(c => {heading.classList.add(c)});
        heading.innerText = text;
        this.screenElement.append(heading);
        return heading;
    },

    createButtons: function(buttonsArray){
        buttonsArray.forEach(button => {
            this.htmlElement = document.createElement('button');
            button.classes.forEach(c => {
                this.htmlElement.classList.add(c)
            });
            this.htmlElement.innerText = button.text;
            this.htmlElement.addEventListener('click',button.onClick.bind(gameData));
            this.screenElement.append(this.htmlElement);
        });
    }

};

//show start screen
gameData.drawStartScreen();