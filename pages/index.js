import React, { useState, useEffect } from "react"

const Index = () => {
    const [game, setGame] = useState(null)

    // load Game
    useEffect(() => {
        async function loadGame(){
            const game = await import("../game")
            setGame(game.default)
        }
        loadGame()
    }, [])

    return (
        <div id="phaser"/>
    )
}

export default Index
