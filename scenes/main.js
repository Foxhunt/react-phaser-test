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

        this.player = this.physics.add.sprite(100, 200, "dude", 4)
        this.player.setBounce(0.2)
        this.player.setCollideWorldBounds(true)

        this.physics.add.collider(this.player, this.platforms)

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: "turn",
            frames: [{ key: "dude", frame: 4 }],
            frameRate: 20
        })

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        })
    }

    update() {
        if (this.cursor.left.isDown && !this.cursor.right.isDown) {
            this.player.setVelocityX(-160)
            this.player.anims.play("left", true)
        } else if (this.cursor.right.isDown && !this.cursor.left.isDown) {
            this.player.setVelocityX(160)
            this.player.anims.play("right", true)
        } else {
            this.player.setVelocityX(0)
            this.player.anims.play("turn")
        }

        if ((this.cursor.space.isDown || this.cursor.up.isDown) && this.player.body.touching.down) {
            this.player.setVelocityY(-160)
        }
    }
}