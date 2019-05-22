const Phaser = require("phaser")
const { Main } = require("./main")

export default new Phaser.Game({
    type: Phaser.AUTO,
    parent: "phaser",
    width: 800,
    height: 600,
    input: {
        gamepad: true
    },
    physics: {
        default: "impact",
        impact: {
            gravity: 800,
            debug: true
        }
    },
    scene: new Main()
})