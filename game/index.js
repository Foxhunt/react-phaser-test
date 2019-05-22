const Phaser = require("phaser")

export default async() => {
    const sceneModues = await Promise.all([
        import("./main"),
        import("./test")
    ])

    const scenes = sceneModues.map(
        scene => new scene.default()
    )

    return new Phaser.Game({
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
        scene: scenes
    })
}
    