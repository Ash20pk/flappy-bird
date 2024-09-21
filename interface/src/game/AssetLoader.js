import { assets } from '../components/game/GameConfig';

export function preloadAssets(scene) {
    scene.load.setBaseURL('/src/assets/');
    
    // Backgrounds and ground
    scene.load.image(assets.scene.background.day, 'background-day-landscape.png');
    scene.load.image(assets.scene.background.night, 'background-night-landscape.png');
    scene.load.spritesheet(assets.scene.ground, 'ground-sprite.png', {
        frameWidth: 336,
        frameHeight: 112
    });

    // Pipes
    scene.load.image(assets.obstacle.pipe.green.top, 'pipe-green-top.png');
    scene.load.image(assets.obstacle.pipe.green.bottom, 'pipe-green-bottom.png');
    scene.load.image(assets.obstacle.pipe.red.top, 'pipe-red-top.png');
    scene.load.image(assets.obstacle.pipe.red.bottom, 'pipe-red-bottom.png');

    // Start game
    scene.load.image(assets.scene.messageInitial, 'message-initial.png');

    // End game
    scene.load.image(assets.scene.gameOver, 'gameover.png');
    scene.load.image(assets.scene.restart, 'restart-button.png');

    // Birds
    scene.load.spritesheet(assets.bird.red, 'bird-red-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    });
    scene.load.spritesheet(assets.bird.blue, 'bird-blue-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    });
    scene.load.spritesheet(assets.bird.yellow, 'bird-yellow-sprite.png', {
        frameWidth: 34,
        frameHeight: 24
    });

    // Numbers
    for (let i = 0; i <= 9; i++) {
        scene.load.image(assets.scoreboard[`number${i}`], `number${i}.png`);
    }
}