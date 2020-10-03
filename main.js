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

//class to generate cuboid html
class HTMLCuboid {
    constructor(name,height,width,depth){
        this.container = document.createElement('div');
        this.container.classList.add(`${name}`);
        //from a top down perspective, depth is z axis, height is y axis, width is x axis
        this.name = name;
        this.height = height;
        this.width = width;
        this.depth = depth;

        class Face {
            constructor(name,xTranslate,xRotate,yTranslate,yRotate,zTranslate,zRotate,height,width){
                this.name = name; //name of div
                this.xTranslate = xTranslate;
                this.xRotate = xRotate;
                this.yTranslate = yTranslate;
                this.yRotate = yRotate;
                this.zTranslate = zTranslate;
                this.zRotate = zRotate;
                this.height = height;
                this.width = width;
            }
        }

        let faces = [
            new Face(`${this.name}--top-face`,0,90,this.height/-2,0,this.depth/2,0,this.depth,this.width),
            new Face(`${this.name}--bottom-face`,0,90,this.height/2,0,this.depth/2,0,this.depth,this.width),
            new Face(`${this.name}--left-face`,this.width/-2,0,0,90,this.depth/2,0,this.height,this.depth),
            new Face(`${this.name}--right-face`,this.width/2,0,0,90,this.depth/2,0,this.height,this.width),
            new Face(`${this.name}--front-face`,0,0,0,0,this.depth,0,this.height,this.width)
        ]

        faces.forEach(face => {
            face.element = document.createElement('div');
            face.element.classList.add(`${face.name}`);
            face.element.style.transform = 
            `translateX(${face.xTranslate}px) translateY(${face.yTranslate}px) translateZ(${face.zTranslate}px)
            rotateX(${face.xRotate}deg) rotateY(${face.yRotate}deg) rotateZ(${face.zRotate}deg)`;
            face.element.style.position = 'absolute';
            face.element.style.height = face.height;
            face.element.style.width = face.width;
        });      

        this.container.append(...faces.map(face=> face.element));
    }
};

class Drop {
    constructor(column, speed, parentElement,height,width,depth,column1Left,column2Left) {
        this.column = column;
        this.speed = speed;
        this.yPosition = 0;
        this.parentElement = parentElement;
        this.height = height;
        this.width = width;
        this.depth = depth;
        //left attribs for col1 and 2
        this.column1Left = column1Left;
        this.column2Left = column2Left;
    }

    createHTML() {
        this.element = new HTMLCuboid('game-screen__drop',this.height,this.width,this.depth).container;
        this.element.style.transition = `all ${gameData.animationDuration}s linear 0s`;
        if (this.column === 1) {this.element.style.left = this.column1Left};
        if (this.column === 2) {this.element.style.left = this.column2Left};
        this.parentElement.append(this.element);
    }

    updatePosition() {
        this.yPosition += this.speed;
        this.element.style.top = `${this.yPosition}px`;
    }

    checkCollision(elementToCollide) {
        //need to check if this element bottom face colides with element to collide bottom face

        //get player bottom and top face
        let playerHeight = parseInt(elementToCollide.querySelector('.game-screen__player--front-face').style.height);     
        let playerWidth = parseInt(elementToCollide.querySelector('.game-screen__player--front-face').style.height); 
        
        let collisionsArr = []
        
        if(parseInt(window.getComputedStyle(this.element).top)+this.height > parseInt(window.getComputedStyle(elementToCollide).top) && parseInt(window.getComputedStyle(this.element).top) < parseInt(window.getComputedStyle(elementToCollide).top)+playerHeight &&
        parseInt(window.getComputedStyle(this.element).left) < parseInt(window.getComputedStyle(elementToCollide).left)+playerWidth && parseInt(window.getComputedStyle(this.element).left)+this.width > parseInt(window.getComputedStyle(elementToCollide).left)) {
            collisionsArr.push([this.element,elementToCollide]);            
        };

        if(collisionsArr.length > 0){gameData.endGame(collisionsArr);}
    }
}

class Player {
    constructor(parent, column, moveKey,height,width,depth,column1Left,column2Left,screenHeight) {
        this.column = column;
        this.parentElement = parent;
        this.moveKey = moveKey;
        this.height = height;
        this.width = width;
        this.depth = depth;
        //left attribs for col1 and 2
        this.column1Left = column1Left;
        this.column2Left = column2Left;
        this.screenHeight = screenHeight;
    }

    createHTML() {
        this.element = new HTMLCuboid('game-screen__player',this.height,this.width,this.depth).container;
        this.element.style.transition = `all ${gameData.moveTime}s linear 0s`;
        this.element.style.left = this.column1Left;
        this.element.style.top = this.screenHeight-(this.height*1.5);
        this.parentElement.append(this.element);
    }

    move() {
        if (this.column === 1) {
            this.element.style.left = this.column2Left;
            setTimeout(() => {this.column = 2}, this.moveTime * 1000);
        } else if (this.column === 2) {
            this.element.style.left = this.column1Left;
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
    gameScreenWidth: window.innerWidth*0.8,
    gameScreenHeight: window.innerHeight,

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

    //set on screen size? (height,width,depth) (y,x,z)
    playerSize: [100,100,100],
    dropSize: [100,100,100],

    containers: [],
    //this should be changed depending on the screen size
    dropGap: window.innerHeight * 0.3,
    playing: true,
    score: undefined,

    startGame: function () {

        //remove previous html
        this.screenElement.innerHTML = '';
        this.screenElement.style.width = this.gameScreenWidth;
        this.screenElement.style.height = this.gameScreenHeight;
        this.column1Left = this.gameScreenWidth*(1/this.controlKeys.length)*0.1;
        this.column2Left = this.gameScreenWidth*(1/this.controlKeys.length)*0.7;
        //set score to 0;
        this.score = 0;

        //display score
        this.scoreElement = this.createText('0','span',['game-screen__score']);

        //calculate drop speed
        this.dropSpeed = this.gameScreenHeight/(this.timeToDrop/this.animationDuration);
        
        //create new containers based on number of assinged control keys
        this.containers = this.controlKeys.map(() => new gameContainer(100/this.controlKeys.length));

        this.containers.forEach((container, index) => {
            container.player = new Player(container.element, 1, this.controlKeys[index], this.playerSize[0],this.playerSize[1],this.playerSize[2],this.column1Left,this.column2Left,this.gameScreenHeight);
            container.drops.push(new Drop(Math.ceil(Math.random() * 2), gameData.dropSpeed, container.element,this.dropSize[0],this.dropSize[1],this.dropSize[2],this.column1Left,this.column2Left));
            container.player.createHTML();
            container.drops.forEach(drop => {
                drop.createHTML()
            });
        });

        //these event listeners are never removed
        document.addEventListener('keydown', (e) => {
            if(gameData.playing){
                this.containers.forEach(container => {
                    if (e.key === container.player.moveKey) {
                        container.player.move();
                    }
                });
            }
        });
        
        this.containers.forEach(container => {
            container.element.addEventListener('click', () => {
                container.player.move();
            });
        });
        
        this.playing = true;
        this.screenElement.style.transform = 'rotateX(40deg) rotateZ(-20deg)';
        setTimeout(()=>{this.runGame()},1000); //GAME START DELAY
    },

    runGame: function () {
        if (gameData.playing) {
            //run function again, for 60fps
            setTimeout(() => {this.runGame()}, this.animationDuration*1000);

            this.containers.forEach(container => {
                container.drops.forEach(drop => {
                    //update drop position
                    drop.updatePosition();
                    //check collision and end game if player has collided with drop
                    drop.checkCollision(container.player.element)
                })
                //1 point for every drop dodged by all players
                this.score += container.removeOldDrops();
                //update score
                this.scoreElement.innerText = this.score;
            })


            // for each container, check if more drops need to be created - if every drop is below the top of the screen by the drop gap amount
            this.containers.forEach(container => {
                if (container.drops.every(drop => drop.yPosition > this.dropGap)) {
                    newDrop = new Drop(Math.ceil(Math.random() * 2), this.dropSpeed, container.element,this.dropSize[0],this.dropSize[1],this.dropSize[2],this.column1Left,this.column2Left);
                    newDrop.createHTML();
                    container.drops.push(newDrop);
                }
            });
        }
    },

    endGame: function(collisionsArr) {
        this.playing = false;
        //stop movement
        this.containers.forEach(c => {
            c.drops.forEach(drop => {drop.element.style.top = window.getComputedStyle(drop.element).top});
            c.player.element.style.left = window.getComputedStyle(c.player.element).left;
        });

        //collisons arrary contains array of arrarys of collided objects [drop, player]
        collisionsArr.forEach(collision => {
            collision[0].childNodes.forEach(child => {
                child.style.backgroundColor = "white";
            });
            collision[1].childNodes.forEach(child => {
                child.style.backgroundColor = "black";
            })
        })

        
        



        //some animation??
        //to end game screen
        this.screenElement.style.transform = 'rotateX(0deg) rotateZ(0deg)';
        setTimeout(()=>{this.drawEndGameScreen()},1500000); //end game pause
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