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

        this.impact.world.setBounds()
        
        this.impact.add.image(200, 600, "ground").setFixedCollision().setGravity(0)
        this.impact.add.image(600, 600, "ground").setFixedCollision().setGravity(0)

        this.player = this.impact.add.sprite(100, 200, "dude", 4).setOrigin(0, 0.15)
        this.player.setActiveCollision()
        this.player.setMaxVelocity(500)
        this.player.setFriction(1000, 100)

        this.player.body.accelGround = 600
        this.player.body.accelAir = 200
        this.player.body.jumpSpeed = 500

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

        const accel = this.player.body.standing ? this.player.body.accelGround : this.player.body.accelAir

        if (this.cursor.left.isDown && !this.cursor.right.isDown) {
            this.player.setAccelerationX(-accel)
            this.player.anims.play("left", true)
        } else if (this.cursor.right.isDown && !this.cursor.left.isDown) {
            this.player.setAccelerationX(accel)
            this.player.anims.play("right", true)
        } else {
            this.player.setAccelerationX(0)
        }

        if (this.player.vel.x === 0) {
            this.player.anims.play("turn")
        }

        if (this.cursor.up.isDown && this.player.body.standing) {
            this.player.setVelocityY(-this.player.body.jumpSpeed)
        }

        if (this.cursor.space.isDown) {
            const direction = this.player.anims.currentAnim.key === "left" ? -1 : 1
            this.player.setVelocityX(500 * direction)
        }
    }
}