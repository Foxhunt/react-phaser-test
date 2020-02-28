import { Scene } from "phaser"

export class Main extends Scene {
    playerMaxMoveVelocity = 200
    playerMaxAtackVelocity = 2000
    attackCoolDownTime = 500
    attackTime = 50
    lastPlayerAtack = 0
    lastEnemyAtack = 0
    peer = undefined
    enemyControls = [false, false, false, false]

    constructor(peer) {
        super()
        this.peer = peer
    }

    preload() {
        this.load.setBaseURL("https://labs.phaser.io")

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

        this.input.gamepad.once("down", pad => {
            console.log("found pad")
            pad.setAxisThreshold(0.3)
            this.gamepad = pad
        })

        this.add.image(400, 300, "sky")

        this.impact.world.setBounds()

        this.impact.add.image(200, 600, "ground").setFixedCollision().setGravity(0)
        this.impact.add.image(600, 600, "ground").setFixedCollision().setGravity(0)

        this.player = this.impact.add.sprite(100, 200, "dude", 5).setOrigin(0, 0.15)
        this.player.setActiveCollision()
        this.player.setMaxVelocity(this.playerMaxMoveVelocity)
        this.player.setFriction(1000, 100)

        this.player.body.accelGround = 600
        this.player.body.accelAir = 200
        this.player.body.jumpSpeed = 400

        this.enemy = this.impact.add.sprite(100, 200, "dude", 5).setOrigin(0, 0.15)
        this.enemy.setActiveCollision()
        this.enemy.setMaxVelocity(this.playerMaxMoveVelocity)
        this.enemy.setFriction(1000, 100)

        this.enemy.body.accelGround = 600
        this.enemy.body.accelAir = 200
        this.enemy.body.jumpSpeed = 400

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

        this.player.anims.play("right", true)

        this.peer.on("data", data => {
            this.enemyControls = JSON.parse(data.toString())
        })

        this.peer.on("connect", () => {
            this.connected = true
        })
    }

    update(time) {
        const movement = this.playerMovement()
        const attack = this.playerAttack(time)

        const [attackD, left, right, jump] = this.enemyControls
        this.enemyMovement(left, right, jump)
        this.enemyAttack(time, attackD)

        const data = JSON.stringify([
            ...attack,
            ...movement
        ])

        if (this.connected) {
            this.peer.send(data)
        }
    }

    playerAttack(time) {
        const attack = this.cursor.space.isDown || this.gamepad && (this.gamepad.B || this.gamepad.X)

        if (attack && time - this.lastPlayerAtack > this.attackCoolDownTime) {
            this.player.setMaxVelocity(this.playerMaxAtackVelocity)
            const direction = this.player.anims.currentAnim.key === "left" ? -1 : 1
            this.player.setVelocityX(this.playerMaxAtackVelocity * direction)
            this.lastPlayerAtack = time
            if (this.impact.world.drawDebug)
                console.log("atack", this.player.maxVel.x, time)
        }

        if (this.player.maxVel.x !== this.playerMaxMoveVelocity && time - this.lastPlayerAtack > this.attackTime) {
            this.player.setMaxVelocity(this.playerMaxMoveVelocity)
            const direction = this.player.anims.currentAnim.key === "left" ? -1 : 1
            this.player.setVelocityX(this.playerMaxMoveVelocity * direction)
            if (this.impact.world.drawDebug)
                console.log("normal", this.player.maxVel.x, time)
        }
        return [new Boolean(attack)]
    }

    playerMovement() {
        const { standing, accelGround, accelAir } = this.player.body
        const accel = standing ? accelGround : accelAir

        const left = this.cursor.left.isDown || this.gamepad && this.gamepad.left
        const right = this.cursor.right.isDown || this.gamepad && this.gamepad.right
        const jump = this.cursor.up.isDown || this.gamepad && (this.gamepad.up || this.gamepad.A)

        if (left && !right) {
            this.player.setAccelerationX(-accel)
            this.player.anims.play("left", true)
        } else if (right && !left) {
            this.player.setAccelerationX(accel)
            this.player.anims.play("right", true)
        } else {
            this.player.setAccelerationX(0)
        }

        if (this.player.vel.x === 0 && this.player.anims.currentAnim) {
            this.player.anims.setCurrentFrame(this.player.anims.currentAnim.frames[0])
        }

        if (jump && this.player.body.standing) {
            this.player.setVelocityY(-this.player.body.jumpSpeed)
        }
        return [new Boolean(left), new Boolean(right), new Boolean(jump)]
    }

    enemyAttack(time, attack) {
        if (attack && time - this.lastEnemyAtack > this.attackCoolDownTime) {
            this.enemy.setMaxVelocity(this.playerMaxAtackVelocity)
            const direction = this.enemy.anims.currentAnim.key === "left" ? -1 : 1
            this.enemy.setVelocityX(this.playerMaxAtackVelocity * direction)
            this.lastEnemyAtack = time
            if (this.impact.world.drawDebug)
                console.log("atack", this.enemy.maxVel.x, time)
        }

        if (this.enemy.maxVel.x !== this.playerMaxMoveVelocity && time - this.lastEnemyAtack > this.attackTime) {
            this.enemy.setMaxVelocity(this.playerMaxMoveVelocity)
            const direction = this.enemy.anims.currentAnim.key === "left" ? -1 : 1
            this.enemy.setVelocityX(this.playerMaxMoveVelocity * direction)
            if (this.impact.world.drawDebug)
                console.log("normal", this.enemy.maxVel.x, time)
        }
    }

    enemyMovement(left, right, jump) {
        const { standing, accelGround, accelAir } = this.enemy.body
        const accel = standing ? accelGround : accelAir

        if (left && !right) {
            this.enemy.setAccelerationX(-accel)
            this.enemy.anims.play("left", true)
        } else if (right && !left) {
            this.enemy.setAccelerationX(accel)
            this.enemy.anims.play("right", true)
        } else {
            this.enemy.setAccelerationX(0)
        }

        if (this.enemy.vel.x === 0 && this.enemy.anims.currentAnim) {
            this.enemy.anims.setCurrentFrame(this.enemy.anims.currentAnim.frames[0])
        }

        if (jump && this.enemy.body.standing) {
            this.enemy.setVelocityY(-this.enemy.body.jumpSpeed)
        }
    }
}
