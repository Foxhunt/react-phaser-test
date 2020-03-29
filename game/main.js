import { Scene, Geom } from "phaser"

export class Main extends Scene {
    playerMaxMoveVelocity = 200
    playerMaxAtackVelocity = 2000
    attackCoolDownTime = 500
    attackTime = 50
    lastPlayerAtack = 0
    lastEnemyAtack = 0

    peer = null
    enemyControls = null
    lastEnemyControls = null

    sequenz = 0
    lastSendData = []

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

        this.add.tileSprite(this.game.canvas.width, this.game.canvas.height / 2, this.game.canvas.width * 2, this.game.canvas.height, "sky")

        this.impact.world.setBounds(0, 0, this.game.canvas.width * 2, this.game.canvas.height)
        this.cameras.main.setBounds(0, 0, this.game.canvas.width * 2, this.game.canvas.height)

        this.impact.add.image(200, 600, "ground").setFixedCollision().setGravity(0)
        this.impact.add.image(800, 600, "ground").setFixedCollision().setGravity(0)

        const playerX = this.peer.initiator ? this.game.canvas.width * 2 - 100 : 100
        this.player = this.impact.add.sprite(playerX, 200, "dude", 5).setOrigin(.5, 0.15)
        this.player.setActiveCollision()
        this.player.setMaxVelocity(this.playerMaxMoveVelocity)
        this.player.setFriction(1000, 100)

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1)

        this.player.body.accelGround = 600
        this.player.body.accelAir = 200
        this.player.body.jumpSpeed = 400

        const enemyX = this.peer.initiator ? 100 : this.game.canvas.width * 2 - 100
        this.enemy = this.impact.add.sprite(enemyX, 200, "dude", 5).setOrigin(.5, 0.15)
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

        if (this.peer.initiator) {
            this.player.anims.play("left", true)
            this.enemy.anims.play("right", true)
        } else {
            this.player.anims.play("right", true)
            this.enemy.anims.play("left", true)
        }

        this.peer.on("data", data => {
            this.enemyControls = JSON.parse(data.toString())
        })
    }

    update(time) {
        const movement = this.playerMovement()
        const attack = this.playerAttack(time)

        const intersection = Geom.Rectangle.Intersection(this.player.getBounds(), this.enemy.getBounds())

        if(intersection.width * intersection.height > 500){
            console.log("intersected with " + (intersection.width * intersection.height))
        }

        const data = [
            this.sequenz++,
            ...attack,
            ...movement
        ]

        data.push(
            this.player.body.pos.x,
            this.player.body.pos.y
        )

        if (this.inputDataChanged(data, this.lastSendData)) {
            this.peer.send(JSON.stringify(data))
            this.lastSendData = data
        }

        this.lastEnemyControls = this.enemyControls || this.lastEnemyControls
        this.enemyControls = null

        if (this.lastEnemyControls) {
            const [enemySequenz, attackD, left, right, jump, x, y] = this.lastEnemyControls
            this.enemyMovement(left, right, jump)
            this.enemyAttack(time, attackD)

            const xError = x - this.enemy.body.pos.x
            const yError = y - this.enemy.body.pos.y

            this.enemy.body.pos.x += xError * .5
            this.enemy.body.pos.y += yError * .5

            //console.log("enemySequenz " + enemySequenz, "playerSequenz " + this.sequenz)
        }
    }

    playerAttack(time) {
        const attack = this.cursor.space.isDown || this.gamepad && (this.gamepad.B || this.gamepad.X)

        // set attack velocity
        if (attack && time - this.lastPlayerAtack > this.attackCoolDownTime) {
            this.player.setMaxVelocity(this.playerMaxAtackVelocity)
            const direction = this.player.anims.currentAnim.key === "left" ? -1 : 1
            this.player.setVelocityX(this.playerMaxAtackVelocity * direction)
            this.player.setCollidesNever()
            this.lastPlayerAtack = time
            if (this.impact.world.drawDebug)
                console.log("atack", this.player.maxVel.x, time)
        }

        // reset velocity
        if (this.player.maxVel.x !== this.playerMaxMoveVelocity && time - this.lastPlayerAtack > this.attackTime) {
            this.player.setMaxVelocity(this.playerMaxMoveVelocity)
            const direction = this.player.anims.currentAnim.key === "left" ? -1 : 1
            this.player.setVelocityX(this.playerMaxMoveVelocity * direction)
            this.player.setActiveCollision()
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
            this.enemy.setCollidesNever()
            this.lastEnemyAtack = time
            if (this.impact.world.drawDebug)
                console.log("atack", this.enemy.maxVel.x, time)
        }

        if (this.enemy.maxVel.x !== this.playerMaxMoveVelocity && time - this.lastEnemyAtack > this.attackTime) {
            this.enemy.setMaxVelocity(this.playerMaxMoveVelocity)
            const direction = this.enemy.anims.currentAnim.key === "left" ? -1 : 1
            this.enemy.setVelocityX(this.playerMaxMoveVelocity * direction)
            this.enemy.setActiveCollision()
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

    inputDataChanged(data, lastSendData) {
        return !(
            data[1].valueOf() == lastSendData[1] &&
            data[2].valueOf() == lastSendData[2] &&
            data[3].valueOf() == lastSendData[3] &&
            data[4].valueOf() == lastSendData[4] &&
            data[5] == lastSendData[5] &&
            data[6] == lastSendData[6]
        )
    }
}
