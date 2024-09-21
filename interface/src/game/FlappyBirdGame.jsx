import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { preloadAssets } from './AssetLoader';
import { assets } from '../components/game/GameConfig';
const FlappyBirdGame = ({ onGameOver }) => {
  const gameRef = useRef(null);

  useEffect(() => {
    const configurations = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: window.innerWidth,
            height: window.innerHeight,
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {y: 300 },
                debug: true
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    }

    const game = new Phaser.Game(configurations);

    let gameOver;
    let gameStarted;
    let upButton;
    let restartButton;
    let gameOverBanner;
    let messageInitial;
    let player;
    let birdName;
    let framesMoveUp;
    let backgroundDay;
    let backgroundNight;
    let ground;
    let pipesGroup
    let gapsGroup
    let nextPipes
    let currentPipe
    let scoreboardGroup
    let score

    function preload () {
        preloadAssets(this)
    }

    function create() {
        const { width, height } = this.sys.game.config;
        
        backgroundDay = this.add.image(width / 2, height / 2, assets.scene.background.day)
            .setDisplaySize(width, height)
            .setInteractive();
        backgroundDay.on('pointerdown', moveBird.bind(this));
        
        backgroundNight = this.add.image(width / 2, height / 2, assets.scene.background.night)
            .setDisplaySize(width, height)
            .setInteractive();
        backgroundNight.visible = false;
        backgroundNight.on('pointerdown', moveBird.bind(this));
    
        gapsGroup = this.physics.add.group()
        pipesGroup = this.physics.add.group()
        scoreboardGroup = this.physics.add.staticGroup()
    
        ground = this.physics.add.sprite(width / 2, height - 56, assets.scene.ground)
            .setDisplaySize(width, 112);
        ground.setCollideWorldBounds(true);
        ground.setDepth(10);
    
        messageInitial = this.add.image(width / 2, height / 2 - 100, assets.scene.messageInitial)
            .setDepth(30)
            .setVisible(false);
    
        upButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
    
        createAnimation(this);
    
        
    
        prepareGame(this)
    
        gameOverBanner = this.add.image(width / 2, height / 2 - 100, assets.scene.gameOver)
            .setDepth(20)
            .setVisible(false);
        
        restartButton = this.add.image(width / 2, height / 2, assets.scene.restart)
            .setInteractive()
            .setDepth(20);
        restartButton.on('pointerdown', restartGame);
        restartButton.visible = false
    }

    function createAnimation(scene) {
        // Ground animations
        scene.anims.create({
            key: assets.animation.ground.moving,
            frames: scene.anims.generateFrameNumbers(assets.scene.ground, {
                start: 0,
                end: 2
            }),
            frameRate: 15,
            repeat: -1
        });

        scene.anims.create({
            key: assets.animation.ground.stop,
            frames: [{
                key: assets.scene.ground,
                frame: 0
            }],
            frameRate: 20
        });

        // Red Bird Animations
        scene.anims.create({
            key: assets.animation.bird.red.clapWings,
            frames: scene.anims.generateFrameNumbers(assets.bird.red, {
                start: 0,
                end: 2
            }),
            frameRate: 10,
            repeat: -1
        })
        scene.anims.create({
            key: assets.animation.bird.red.stop,
            frames: [{
                key: assets.bird.red,
                frame: 1
            }],
            frameRate: 20
        })
    
        // Blue Bird animations
        scene.anims.create({
            key: assets.animation.bird.blue.clapWings,
            frames: scene.anims.generateFrameNumbers(assets.bird.blue, {
                start: 0,
                end: 2
            }),
            frameRate: 10,
            repeat: -1
        })
        scene.anims.create({
            key: assets.animation.bird.blue.stop,
            frames: [{
                key: assets.bird.blue,
                frame: 1
            }],
            frameRate: 20
        })
    
        // Yellow Bird animations
        scene.anims.create({
            key: assets.animation.bird.yellow.clapWings,
            frames: scene.anims.generateFrameNumbers(assets.bird.yellow, {
                start: 0,
                end: 2
            }),
            frameRate: 10,
            repeat: -1
        });

        scene.anims.create({
            key: assets.animation.bird.yellow.stop,
            frames: [{
                key: assets.bird.yellow,
                frame: 1
            }],
            frameRate: 20
        })
    }
    function update() {
        if (gameOver || !gameStarted)
            return

        if (framesMoveUp > 0)
            framesMoveUp--
        else if (Phaser.Input.Keyboard.JustDown(upButton))
            moveBird()
        else {
            player.setVelocityY(120)

            if (player.angle < 90)
                player.angle += 1
        }

        pipesGroup.children.iterate(function (child) {
            if (child == undefined)
                return

            if (child.x < -50)
                child.destroy()
            else
                child.setVelocityX(-100)
        })

        gapsGroup.children.iterate(function (child) {
            child.body.setVelocityX(-100)
        })

        nextPipes++

        //this is the distance after which a new pipe is created
        if (nextPipes === 300) {
            makePipes(game.scene.scenes[0])
            nextPipes = 0
        }
    }

    function hitBird(player) {
        this.physics.pause()
    
        gameOver = true
        gameStarted = false
    
        player.anims.play(getAnimationBird(birdName).stop)
        ground.anims.play(assets.animation.ground.stop)
    
        gameOverBanner.visible = true
        // restartButton.visible = true
        onGameOver(score); //Handling the end game and resolve the final score to blockchain
    }

    function updateScore(_, gap) {
        score++
        gap.destroy()
    
        if (score % 10 == 0) {
            backgroundDay.visible = !backgroundDay.visible
            backgroundNight.visible = !backgroundNight.visible
    
            if (currentPipe === assets.obstacle.pipe.green)
                currentPipe = assets.obstacle.pipe.red
            else
                currentPipe = assets.obstacle.pipe.green
        }
    
        updateScoreboard()
    }
    

    function makePipes(scene) {
        if (!gameStarted || gameOver) return

        const { width, height } = scene.sys.game.config;

        //this is the distance from birds start to the first pipe
        const pipeHorizontalDistance = 300;

        const pipeVerticalGap = 150; 

        //generate random number between -200 and height - 320 - pipeVerticalGap
        const pipeTopY = Phaser.Math.Between(-200, height - 520 - pipeVerticalGap)

        const gap = scene.add.line(pipeHorizontalDistance, pipeTopY + 210, 0, 0, 0, pipeVerticalGap)
        gapsGroup.add(gap)
        gap.body.allowGravity = false
        gap.visible = false

        const pipeTop = pipesGroup.create(pipeHorizontalDistance, pipeTopY, currentPipe.top)
        pipeTop.body.allowGravity = false

        // 720 is the height of the elongate pipes
        const pipeBottom = pipesGroup.create(pipeHorizontalDistance, pipeTopY + 720 + pipeVerticalGap, currentPipe.bottom)
        pipeBottom.body.allowGravity = false
    }
    

    function moveBird() {
        if (gameOver)
            return
    
        if (!gameStarted)
            startGame(game.scene.scenes[0])
    
        player.setVelocityY(-400)
        player.angle = -15
        framesMoveUp = 5
    }

    //We can use chainlink here
    function getRandomBird() {
        switch (Phaser.Math.Between(0, 2)) {
            case 0:
                return assets.bird.red
            case 1:
                return assets.bird.blue
            case 2:
            default:
                return assets.bird.yellow
        }
    }

    //We can use chainlink here
    function getAnimationBird(birdColor) {
        switch (birdColor) {
            case assets.bird.red:
                return assets.animation.bird.red
            case assets.bird.blue:
                return assets.animation.bird.blue
            case assets.bird.yellow:
            default:
                return assets.animation.bird.yellow
        }
    }

    function updateScoreboard() {
        scoreboardGroup.clear(true, true)
    
        const scoreAsString = score.toString()
        if (scoreAsString.length == 1)
            scoreboardGroup.create(assets.scene.width, 30, assets.scoreboard.base + score).setDepth(10)
        else {
            let initialPosition = assets.scene.width - ((score.toString().length * assets.scoreboard.width) / 2)
    
            for (let i = 0; i < scoreAsString.length; i++) {
                scoreboardGroup.create(initialPosition, 30, assets.scoreboard.base + scoreAsString[i]).setDepth(10)
                initialPosition += assets.scoreboard.width
            }
        }
    }

    function restartGame() {
        pipesGroup.clear(true, true)
        pipesGroup.clear(true, true)
        gapsGroup.clear(true, true)
        scoreboardGroup.clear(true, true)
        player.destroy()
        gameOverBanner.visible = false
        restartButton.visible = false
    
        const gameScene = game.scene.scenes[0]
        prepareGame(gameScene)
    
        gameScene.physics.resume()
    }

    function prepareGame(scene) {
        const { width, height } = scene.sys.game.config;
        framesMoveUp = 0
        nextPipes = 0
        currentPipe = assets.obstacle.pipe.green
        score = 0
        gameOver = false
        backgroundDay.visible = true
        backgroundNight.visible = false
        messageInitial.visible = true
    
        birdName = getRandomBird()
        player = scene.physics.add.sprite(width / 2.5, height/2.3, birdName)
        player.setCollideWorldBounds(true)
        player.anims.play(getAnimationBird(birdName).clapWings, true)
        player.body.allowGravity = false
    
        scene.physics.add.collider(player, ground, hitBird, null, scene)
        scene.physics.add.collider(player, pipesGroup, hitBird, null, scene)
    
        scene.physics.add.overlap(player, gapsGroup, updateScore, null, scene)
    
        ground.anims.play(assets.animation.ground.moving, true)
    }

    function startGame(scene) {
        gameStarted = true
        messageInitial.visible = false
    
        const score0 = scoreboardGroup.create(assets.scene.width, 30, assets.scoreboard.number0)
        score0.setDepth(20)
    
        makePipes(scene)
    }

  return () => {
    game.destroy(true);
  };
}, [onGameOver]);

// return <div ref={gameRef} style={{ width: '288px', height: '512px' }} />;
};

export default FlappyBirdGame;