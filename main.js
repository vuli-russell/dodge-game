//classes
class Drop {
    constructor(column,speed,parentElement){
        this.column = column;
        this.speed = speed;
        this.yPosition = 0;
        this.parentElement = parentElement;
        this.animationDuration = 0.1;
    }

    createHTML(){
        this.element = document.createElement('div');
        this.element.classList.add('game-screen__drop');
        this.element.style.transition = `all ${this.animationDuration}s linear 0s`
        this.parentElement.append(this.element);
    }

    updatePosition(){
        this.yPosition += this.speed;
        this.element.style.top = `${this.yPosition}px`;

    }
}

class Player {
    constructor(parent, column, moveTime, moveKey){
        this.column = column;
        this.moveTime = moveTime;
        this.parentElement = parent;
        this.moveKey = moveKey;
    }

    createHTML(){
        this.element = document.createElement('div');
        this.element.classList.add('game-screen__player');
        this.element.style.transition = `all ${this.moveTime}s linear 0s`
        this.parentElement.append(this.element);
    }

    move(){        
        if(this.column === 1){            
            this.element.style.left = '20vw';
            setTimeout(()=>{this.column = 2},this.moveTime*1000)
        } else if(this.column === 2){
            this.element.style.left = '0vw';
            setTimeout(()=>{this.column = 1},this.moveTime*1000)
        }
    }
}




//setup game

const gameData = {
    //populate from start screen when added
    controlKeys: ['ArrowLeft','ArrowRight'],
    //create 1 player for each 'screen side'
    players: [],
    drops: [],
    playing: true,
    instantiatePlayers: function(){
        this.players = [...document.querySelectorAll('.game-screen__side')].map((element,index)=>new Player(element,1,0.3,this.controlKeys[index]));
    },
    checkDrops: function(){
        //if drops are below the bottom of the screen then delete

        //if all drops are below XX then create a new drop

    }
};


//game loop


//to start game
gameData.instantiatePlayers();

gameData.players.forEach(player=>player.createHTML());

document.addEventListener('keydown',(e)=>{
    gameData.players.forEach(player => {
        if(e.key === player.moveKey){
            player.move();
        }        
    });
})

let dropsTest = new Drop(1,10,document.querySelectorAll('.game-screen__side')[0]);
dropsTest.createHTML();


runGame = () => {
    //run function again, for 60fps
    setTimeout(runGame,(100));

    //update drop position
    dropsTest.updatePosition();

    //check collision

};

runGame();