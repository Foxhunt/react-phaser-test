const Phaser = require("phaser")
const { Main } = require("./main")

export default (new Phaser.Game({
    type: Phaser.AUTO,
    parent: "phaser",
    width: 800,
    height: 600,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: new Main()
}))