import Phaser from 'phaser';

import backgroundDayImage from '../assets/background-day.png';
import backgroundNightImage from '../assets/background-night.png';
import groundSpriteImage from '../assets/ground-sprite.png';
import pipeGreenTopImage from '../assets/pipe-green-top.png';
import pipeGreenBottomImage from '../assets/pipe-green-bottom.png';
import pipeRedTopImage from '../assets/pipe-red-top.png';
import pipeRedBottomImage from '../assets/pipe-red-bottom.png';
import messageInitialImage from '../assets/message-initial.png';
import gameOverImage from '../assets/gameover.png';
import restartButtonImage from '../assets/restart-button.png';
import birdRedSpriteImage from '../assets/bird-red-sprite.png';
import birdBlueSpriteImage from '../assets/bird-blue-sprite.png';
import birdYellowSpriteImage from '../assets/bird-yellow-sprite.png';
import number0Image from '../assets/number0.png';
import number1Image from '../assets/number1.png';
import number2Image from '../assets/number2.png';
import number3Image from '../assets/number3.png';
import number4Image from '../assets/number4.png';
import number5Image from '../assets/number5.png';
import number6Image from '../assets/number6.png';
import number7Image from '../assets/number7.png';
import number8Image from '../assets/number8.png';
import number9Image from '../assets/number9.png';

export default class FlappyBirdGame {
  constructor(parentElement, onGameOver) {
    this.config = {
      type: Phaser.AUTO,
      width: 288,
      height: 512,
      parent: parentElement,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false
        }
      },
      scene: {
        preload: this.preload.bind(this),
        create: this.create.bind(this),
        update: this.update.bind(this)
      }
    };

    this.game = new Phaser.Game(this.config);
    this.onGameOver = onGameOver;

    // Game variables
    this.gameOver = false;
    this.gameStarted = false;
    this.player = null;
    this.pipesGroup = null;
    this.gapsGroup = null;
    this.ground = null;
    this.score = 0;
    this.scoreboardGroup = null;
    this.backgroundDay = null;
    this.backgroundNight = null;
    this.messageInitial = null;
    this.gameOverBanner = null;
    this.restartButton = null;
    this.currentPipe = null;
    this.nextPipes = 0;
    this.framesMoveUp = 0;
    this.upButton = null;
    this.birdName = null;

    this.assets = {
      bird: {
        red: 'bird-red',
        yellow: 'bird-yellow',
        blue: 'bird-blue'
      },
      obstacle: {
        pipe: {
          green: {
            top: 'pipe-green-top',
            bottom: 'pipe-green-bottom'
          },
          red: {
            top: 'pipe-red-top',
            bottom: 'pipe-red-bottom'
          }
        }
      },
      scene: {
        width: 144,
        background: {
          day: 'background-day',
          night: 'background-night'
        },
        ground: 'ground',
        gameOver: 'game-over',
        restart: 'restart-button',
        messageInitial: 'message-initial'
      },
      scoreboard: {
        width: 25,
        base: 'number',
        number0: 'number0',
        number1: 'number1',
        number2: 'number2',
        number3: 'number3',
        number4: 'number4',
        number5: 'number5',
        number6: 'number6',
        number7: 'number7',
        number8: 'number8',
        number9: 'number9'
      },
      animation: {
        bird: {
          red: {
            clapWings: 'red-clap-wings',
            stop: 'red-stop'
          },
          blue: {
            clapWings: 'blue-clap-wings',
            stop: 'blue-stop'
          },
          yellow: {
            clapWings: 'yellow-clap-wings',
            stop: 'yellow-stop'
          }
        },
        ground: {
          moving: 'moving-ground',
          stop: 'stop-ground'
        }
      }
    };
  }

  preload() {
    this.load.image(this.assets.scene.background.day, backgroundDayImage);
    this.load.image(this.assets.scene.background.night, backgroundNightImage);
    this.load.spritesheet(this.assets.scene.ground, groundSpriteImage, {
      frameWidth: 336,
      frameHeight: 112
    });
    this.load.image(this.assets.obstacle.pipe.green.top, pipeGreenTopImage);
    this.load.image(this.assets.obstacle.pipe.green.bottom, pipeGreenBottomImage);
    this.load.image(this.assets.obstacle.pipe.red.top, pipeRedTopImage);
    this.load.image(this.assets.obstacle.pipe.red.bottom, pipeRedBottomImage);
    this.load.image(this.assets.scene.messageInitial, messageInitialImage);
    this.load.image(this.assets.scene.gameOver, gameOverImage);
    this.load.image(this.assets.scene.restart, restartButtonImage);
    this.load.spritesheet(this.assets.bird.red, birdRedSpriteImage, {
      frameWidth: 34,
      frameHeight: 24
    });
    this.load.spritesheet(this.assets.bird.blue, birdBlueSpriteImage, {
      frameWidth: 34,
      frameHeight: 24
    });
    this.load.spritesheet(this.assets.bird.yellow, birdYellowSpriteImage, {
      frameWidth: 34,
      frameHeight: 24
    });
    this.load.image(this.assets.scoreboard.number0, number0Image);
    this.load.image(this.assets.scoreboard.number1, number1Image);
    this.load.image(this.assets.scoreboard.number2, number2Image);
    this.load.image(this.assets.scoreboard.number3, number3Image);
    this.load.image(this.assets.scoreboard.number4, number4Image);
    this.load.image(this.assets.scoreboard.number5, number5Image);
    this.load.image(this.assets.scoreboard.number6, number6Image);
    this.load.image(this.assets.scoreboard.number7, number7Image);
    this.load.image(this.assets.scoreboard.number8, number8Image);
    this.load.image(this.assets.scoreboard.number9, number9Image);
  }

  create() {
    this.backgroundDay = this.add.image(this.assets.scene.width, 256, this.assets.scene.background.day).setInteractive();
    this.backgroundDay.on('pointerdown', this.moveBird.bind(this));
    this.backgroundNight = this.add.image(this.assets.scene.width, 256, this.assets.scene.background.night).setInteractive();
    this.backgroundNight.visible = false;
    this.backgroundNight.on('pointerdown', this.moveBird.bind(this));

    this.gapsGroup = this.physics.add.group();
    this.pipesGroup = this.physics.add.group();
    this.scoreboardGroup = this.physics.add.staticGroup();

    this.ground = this.physics.add.sprite(this.assets.scene.width, 458, this.assets.scene.ground);
    this.ground.setCollideWorldBounds(true);
    this.ground.setDepth(10);

    this.messageInitial = this.add.image(this.assets.scene.width, 156, this.assets.scene.messageInitial);
    this.messageInitial.setDepth(30);
    this.messageInitial.visible = false;

    this.upButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

    // Ground animations
    this.anims.create({
      key: this.assets.animation.ground.moving,
      frames: this.anims.generateFrameNumbers(this.assets.scene.ground, {
        start: 0,
        end: 2
      }),
      frameRate: 15,
      repeat: -1
    });
    this.anims.create({
      key: this.assets.animation.ground.stop,
      frames: [{
        key: this.assets.scene.ground,
        frame: 0
      }],
      frameRate: 20
    });

    // Bird animations
    this.createBirdAnimations(this.assets.bird.red, this.assets.animation.bird.red);
    this.createBirdAnimations(this.assets.bird.blue, this.assets.animation.bird.blue);
    this.createBirdAnimations(this.assets.bird.yellow, this.assets.animation.bird.yellow);

    this.gameOverBanner = this.add.image(this.assets.scene.width, 206, this.assets.scene.gameOver);
    this.gameOverBanner.setDepth(20);
    this.gameOverBanner.visible = false;

    this.restartButton = this.add.image(this.assets.scene.width, 300, this.assets.scene.restart).setInteractive();
    this.restartButton.on('pointerdown', this.restartGame.bind(this));
    this.restartButton.setDepth(20);
    this.restartButton.visible = false;

    this.prepareGame();
  }

  update() {
    if (this.gameOver || !this.gameStarted) return;

    if (this.framesMoveUp > 0) {
      this.framesMoveUp--;
    } else if (Phaser.Input.Keyboard.JustDown(this.upButton)) {
      this.moveBird();
    } else {
      this.player.setVelocityY(120);
      if (this.player.angle < 90) {
        this.player.angle += 1;
      }
    }

    this.pipesGroup.children.entries.forEach((pipe) => {
      if (pipe.x < -50) {
        pipe.destroy();
      } else {
        pipe.setVelocityX(-100);
      }
    });

    this.gapsGroup.children.entries.forEach((gap) => {
      gap.body.setVelocityX(-100);
    });

    this.nextPipes++;
    if (this.nextPipes === 130) {
      this.makePipes();
      this.nextPipes = 0;
    }
  }

  hitBird() {
    this.physics.pause();

    this.gameOver = true;
    this.gameStarted = false;

    this.player.anims.play(this.getAnimationBird(this.birdName).stop);
    this.ground.anims.play(this.assets.animation.ground.stop);

    this.gameOverBanner.visible = true;
    this.restartButton.visible = true;

    this.onGameOver(this.score);
  }

  updateScore(_, gap) {
    this.score++;
    gap.destroy();

    if (this.score % 10 === 0) {
      this.backgroundDay.visible = !this.backgroundDay.visible;
      this.backgroundNight.visible = !this.backgroundNight.visible;

      if (this.currentPipe === this.assets.obstacle.pipe.green) {
        this.currentPipe = this.assets.obstacle.pipe.red;
      } else {
        this.currentPipe = this.assets.obstacle.pipe.green;
      }
    }

    this.updateScoreboard();
  }

  makePipes() {
    if (!this.gameStarted || this.gameOver) return;

    const pipeTopY = Phaser.Math.Between(-120, 120);
    const gap = this.add.line(288, pipeTopY + 210, 0, 0, 0, 98);
    this.gapsGroup.add(gap);
    gap.body.allowGravity = false;
    gap.visible = false;

    const pipeTop = this.pipesGroup.create(288, pipeTopY, this.currentPipe.top);
    pipeTop.body.allowGravity = false;

    const pipeBottom = this.pipesGroup.create(288, pipeTopY + 420, this.currentPipe.bottom);
    pipeBottom.body.allowGravity = false;
  }

  moveBird() {
    if (this.gameOver) return;

    if (!this.gameStarted) this.startGame();

    this.player.setVelocityY(-400);
    this.player.angle = -15;
    this.framesMoveUp = 5;
  }

  getRandomBird() {
    const birds = [this.assets.bird.red, this.assets.bird.blue, this.assets.bird.yellow];
    return birds[Math.floor(Math.random() * birds.length)];
  }

  getAnimationBird(birdColor) {
    switch (birdColor) {
      case this.assets.bird.red:
        return this.assets.animation.bird.red;
      case this.assets.bird.blue:
        return this.assets.animation.bird.blue;
      case this.assets.bird.yellow:
      default:
        return this.assets.animation.bird.yellow;
    }
  }

  updateScoreboard() {
    this.scoreboardGroup.clear(true, true);

    const scoreAsString = this.score.toString();
    if (scoreAsString.length === 1) {
      this.scoreboardGroup.create(this.assets.scene.width, 30, this.assets.scoreboard.base + this.score).setDepth(10);
    } else {
      let initialPosition = this.assets.scene.width - ((scoreAsString.length * this.assets.scoreboard.width) / 2);

      for (let i = 0; i < scoreAsString.length; i++) {
        this.scoreboardGroup.create(initialPosition, 30, this.assets.scoreboard.base + scoreAsString[i]).setDepth(10);
        initialPosition += this.assets.scoreboard.width;
      }
    }
  }

  restartGame() {
    this.pipesGroup.clear(true, true);
    this.gapsGroup.clear(true, true);
    this.scoreboardGroup.clear(true, true);
    this.player.destroy();
    this.gameOverBanner.visible = false;
    this.restartButton.visible = false;

    this.prepareGame();
    this.physics.resume();
  }

  prepareGame() {
    this.framesMoveUp = 0;
    this.nextPipes = 0;
    this.currentPipe = this.assets.obstacle.pipe.green;
    this.score = 0;
    this.gameOver = false;
    this.backgroundDay.visible = true;
    this.backgroundNight.visible = false;
    this.messageInitial.visible = true;

    this.birdName = this.getRandomBird();
    this.player = this.physics.add.sprite(60, 265, this.birdName);
    this.player.setCollideWorldBounds(true);
    this.player.anims.play(this.getAnimationBird(this.birdName).clapWings, true);
    this.player.body.allowGravity = false;

    this.physics.add.collider(this.player, this.ground, this.hitBird, null, this);
    this.physics.add.collider(this.player, this.pipesGroup, this.hitBird, null, this);

    this.physics.add.overlap(this.player, this.gapsGroup, this.updateScore, null, this);

    this.ground.anims.play(this.assets.animation.ground.moving, true);
  }

  startGame() {
    this.gameStarted = true;
    this.messageInitial.visible = false;

    const score0 = this.scoreboardGroup.create(this.assets.scene.width, 30, this.assets.scoreboard.number0);
    score0.setDepth(20);

    this.makePipes();
  }

  createBirdAnimations(birdKey, animations) {
    this.anims.create({
      key: animations.clapWings,
      frames: this.anims.generateFrameNumbers(birdKey, {
        start: 0,
        end: 2
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: animations.stop,
      frames: [{
        key: birdKey,
        frame: 1
      }],
      frameRate: 20
    });
  }

  destroy() {
    this.game.destroy(true);
  }
}