import { Scene } from "phaser"

export class Main extends Scene {
    preload() {
        this.load.setBaseURL("http://labs.phaser.io")

        this.load.image("sky", "assets/skies/space3.png")
        
        this.load.image("ground", "assets/sprites/platform.png")
        this.load.image("loop", "assets/sprites/loop.png")

        this.load.spritesheet("dude", 
            "assets/sprites/dude.png",
            { frameWidth: 32, frameHeight: 48 }
        )
    }

    create() {
        this.cursor = this.input.keyboard.createCursorKeys()
        
        this.add.image(400, 300, "sky")

        this.platforms = this.physics.add.staticGroup()
        this.platforms.create(200, 600, "ground")
        this.platforms.create(600, 600, "ground")

        const player = this.physics.add.sprite(100, 200, "dude")
        player.setBounce(0.2)
        player.setCollideWorldBounds(true)

        this.cursor.down.onDown = () => {
            console.log("down")
        }
    }

    update() {

    }

}