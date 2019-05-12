import React, { useState, useEffect } from "react"

const Index = () => {
    const [Phaser, setPhaser] = useState(null)
    const [Game, setGame] = useState(null)
    const [scenes, setScenes] = useState(null)

    // load Phaser
    useEffect(() => {
        setPhaser(require("phaser"))
        setScenes(require("../scenes/"))
    }, [])

    if(Phaser && scenes && !Game){
        setGame(new Phaser.Game({
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
            scene: new scenes.Main()
        }))
    }

    return (
        <div id="phaser"/>
    )
}

export default Index
