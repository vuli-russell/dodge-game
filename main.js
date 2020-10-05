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
    constructor(name,height,width,depth,floatHeight){
        this.container = document.createElement('div');
        this.container.style.transform = `translateZ(${floatHeight}px)`;
        this.container.style.position = 'absolute';
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

        this.faces = [
            new Face(`${this.name}--top-face`,0,90,0,0,0,0,this.depth,this.width),
            new Face(`${this.name}--bottom-face`,0,90,this.height,0,0,0,this.depth,this.width),
            new Face(`${this.name}--left-face`,0,0,0,-90,0,0,this.height,this.depth),
            new Face(`${this.name}--right-face`,this.width,0,0,-90,0,0,this.height,this.depth),
            new Face(`${this.name}--front-face`,0,0,0,0,this.depth,0,this.height,this.width)
        ]
        this.setFaceStyles = function(){
            this.faces.forEach(face => {
                face.element = document.createElement('div');
                face.element.classList.add(`${face.name}`);
                face.element.style.transformOrigin = 'top left';
                face.element.style.transform = 
                `translateX(${face.xTranslate}px) translateY(${face.yTranslate}px) translateZ(${face.zTranslate}px)
                rotateX(${face.xRotate}deg) rotateY(${face.yRotate}deg) rotateZ(${face.zRotate}deg)`;
                face.element.style.position = 'absolute';
                face.element.style.height = face.height;
                face.element.style.width = face.width;
            });

            this.container.innerHTML = '';
            this.container.append(...this.faces.map(face=> face.element));
        }
        
        this.setFaceStyles();        
    }

    updateHeight(height) {
        this.height = height;
        this.faces[1].yTranslate = this.height;
        this.faces[2].height = this.height;
        this.faces[3].height = this.height;
        this.faces[4].height = this.height;

        this.setFaceStyles();
    }

    updateWidth(width) {
        this.width = width;
        this.faces[0].width = this.width;
        this.faces[1].width = this.width;
        this.faces[3].xTranslate = this.width;
        this.faces[4].width = this.width;

        this.setFaceStyles();
    }

    updateDepth(depth) {
        this.depth = depth;
        this.faces[0].height = this.depth;
        this.faces[1].height = this.depth;
        this.faces[2].width = this.depth;
        this.faces[3].width = this.depth;
        this.faces[4].zTranslate = this.depth;

        this.setFaceStyles();
    }
};


class Drop {
    constructor(column, speed, parentElement,height,width,depth,column1Left,column2Left,floatHeight) {
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
        this.floatHeight = floatHeight;
    }

    createHTML() {
        this.element = new HTMLCuboid('game-screen__drop',this.height,this.width,this.depth,this.floatHeight).container;
        this.element.style.transition = `all ${gameData.animationDuration}s linear 0s`;
        if (this.column === 1) {this.element.style.left = this.column1Left+(this.width/2)};
        if (this.column === 2) {this.element.style.left = this.column2Left+(this.width/2)};
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
    constructor(parent, column, moveKey,height,width,depth,column1Left,column2Left,screenHeight,floatHeight,moveTime) {
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
        this.floatHeight = floatHeight
        this.moveTime = moveTime;
    }

    createHTML() {
        this.element = new HTMLCuboid('game-screen__player',this.height,this.width,this.depth,this.floatHeight).container;
        this.element.style.transition = `all ${gameData.moveTime}s linear 0s`;
        this.element.style.transform = 'rotateZ(0deg)'
        this.element.style.left = this.column1Left;
        this.element.style.top = this.screenHeight-(this.height*1.5);
        this.parentElement.append(this.element);
    }

    move() {
        if (this.column === 1) {
            this.element.style.left = this.column2Left;
            this.element.style.transform = 'rotateZ(30deg)';
            setTimeout(() => {
                this.column = 2;
                this.element.style.transform = 'rotateZ(0deg)';
            }, this.moveTime * 500);
        } else if (this.column === 2) {
            this.element.style.left = this.column1Left;
            this.element.style.transform = 'rotateZ(-30deg)';
            setTimeout(() => {
                this.column = 1
                this.element.style.transform = 'rotateZ(0deg)';
            }, this.moveTime * 500);
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
    gameScreenWidth: window.innerWidth*0.7,
    gameScreenHeight: window.innerHeight*0.8,

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
   
    playing: true,
    score: undefined,

    //load sounds
    explosionAudio: new Audio('./assets/sounds/explosion.mp3'),

    startGame: function () {

        this.playerWidth = (this.gameScreenWidth/(this.controlKeys.length))*0.15
        this.playerHeight = this.playerWidth*2
        this.dropWidth = this.playerWidth/2
        this.dropHeight = this.playerHeight/2
    
        
         //set on screen size? (height,width,depth) (y,x,z)
        this.playerSize = [this.playerHeight,this.playerWidth,this.playerWidth/2],
        this.dropSize = [this.dropHeight,this.dropWidth,this.dropWidth/2],
        this.playerFloatHeight = 10;
        this.dropFloatHeight = 15;

        //set by difficulty
        this.dropGap = this.playerHeight*2.5;

        //remove previous html
        this.screenElement.innerHTML = '';
        this.screenElement.style.width = this.gameScreenWidth;
        this.screenElement.style.height = this.gameScreenHeight*2;
        this.screenElement.style.top = -this.gameScreenHeight*0.75;
        this.column1Left = this.gameScreenWidth*(1/this.controlKeys.length)*0.1;
        this.column2Left = this.gameScreenWidth*(1/this.controlKeys.length)*0.7;
        //set score to 0;
        this.score = 0;

        //display score
        this.scoreElement = this.createText('0','span',['game-screen__score']);
        this.scoreElement.style.position = 'absolute';
        this.scoreElement.style.bottom = '0px';

        //calculate drop speed
        this.dropSpeed = this.gameScreenHeight/(this.timeToDrop/this.animationDuration);

        //for increasing diffuiculty
        this.oldScore = 0;
        
        //create new containers based on number of assinged control keys
        this.containers = this.controlKeys.map(() => new gameContainer(100/this.controlKeys.length));

        this.containers.forEach((container, index) => {
            container.player = new Player(container.element, 1, this.controlKeys[index], this.playerSize[0],this.playerSize[1],this.playerSize[2],this.column1Left,this.column2Left,this.gameScreenHeight*2,this.playerFloatHeight,this.moveTime);
            container.drops.push(new Drop(Math.ceil(Math.random() * 2), gameData.dropSpeed, container.element,this.dropSize[0],this.dropSize[1],this.dropSize[2],this.column1Left,this.column2Left,this.dropFloatHeight));
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
                if(gameData.playing){
                    container.player.move();
                }
            });
        });
        
        this.playing = true;
        this.screenElement.style.transform = 'rotateX(30deg) rotateZ(-10deg)';
        setTimeout(()=>{this.runGame()},100); //GAME START DELAY
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
                //1 point for every drop dodged
                if(container.removeOldDrops){
                    this.score += container.removeOldDrops();
                    //update score
                    this.scoreElement.innerText = this.score;
                    if(Math.floor(this.score/10)>Math.floor(this.oldScore/10)){
                        this.oldScore = this.score
                        this.dropSpeed *=1.05;
                        console.log(this.dropSpeed);
                    }
                }                
            })


            // for each container, check if more drops need to be created - if every drop is below the top of the screen by the drop gap amount
            this.containers.forEach(container => {
                if (container.drops.every(drop => drop.yPosition > this.dropGap)) {
                    newDrop = new Drop(Math.ceil(Math.random() * 2), this.dropSpeed, container.element,this.dropSize[0],this.dropSize[1],this.dropSize[2],this.column1Left,this.column2Left,this.dropFloatHeight);
                    newDrop.createHTML();
                    container.drops.push(newDrop);
                }
            });
        }
    },

    endGame: function(collisionsArr) {
        this.playing = false;
        //play explosion - slightly slow
        this.explosionAudio.play();
        //stop movement
        this.containers.forEach(c => {
            c.drops.forEach(drop => {drop.element.style.top = window.getComputedStyle(drop.element).top});
            c.player.element.style.left = window.getComputedStyle(c.player.element).left;
        });

        //explosion nonsense

        this.explosion = new HTMLCuboid('game-screen__explosion',this.playerSize[0]/2,this.playerSize[1]/2,0,0);        
        collisionsArr[0][1].append(this.explosion.container);
        this.explosion.container.style.top = `${this.playerSize[0]/4}px`;
        this.explosion.container.style.left = `${this.playerSize[1]/4}px`;      
        this.explosion.container.style.transition = 'none';
        //rotate screen to show
        this.screenElement.style.transform = 'rotateX(40deg) rotateZ(-20deg)';
        
        //animate column height
        for (let i = 0; i < 120; i++) {
            setTimeout(()=>{
                this.explosion.updateDepth((i/120)*this.gameScreenHeight*3);
                this.explosion.updateWidth((i/120)*this.gameScreenHeight*3);
                this.explosion.container.style.left = `${((i/120)*this.gameScreenHeight*3*-1/2)+this.playerSize[0]/2}px`;
                this.explosion.updateHeight((i/120)*this.gameScreenHeight*3);
                this.explosion.container.style.top = `${((i/120)*this.gameScreenHeight*3*-1/2)+this.playerSize[1]/2}px`
                //color change?
            },(1000*i)/120)            
        }
 
        setTimeout(()=>{
            this.drawEndGameScreen();
            this.screenElement.style.transform = 'rotateX(0deg) rotateZ(0deg)';
            this.screenElement.style.height = this.gameScreenHeight;
            this.screenElement.style.top = 0;
        },1500); //end game pause
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
        this.screenElement.innerHTML = '';

        this.createText('How To Play','h1',['game-screen__title']);

        this.createText(`You must dodge incoming evil cubes(...its all i can make🤷‍♀️), in multiple lanes at once.`,'p',['game-screen__text']);
        this.createText(`Each lane is made up of two channels which the players and cubes can occupy`,'p',['game-screen__text']);
        this.createText(`Use the assigned keys (left and right arrows by default), or tap the lane, to move the player in a lane to the other channel`,'p',['game-screen__text']);
        this.createText(`The speed will increase every 10 dodged enemies, Good Luck!`,'p',['game-screen__text']);
        this.createText(`Use the settings screen to change controls or add extra difficulty`,'p',['game-screen__text']);

        instructionsScreenButtons = [
            new menuButton(['game-screen__button'],'Start Game',gameData.startGame),
            new menuButton(['game-screen__button'],'Settings',gameData.drawOptionsScreen),
            new menuButton(['game-screen__button'],'Back to Menu',gameData.drawStartScreen)
        ];

        this.createButtons(instructionsScreenButtons);

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