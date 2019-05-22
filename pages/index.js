import React, { useEffect } from "react"

const Index = () => {
    // load Game
    useEffect(() => {
        loadGame("2")
    }, [])

    return (
        <div id="phaser"/>
    )
}

export default Index

function loadGame(game){
    switch(game){
        case "1":
            import("../game")
        case "2":
            import("../game2")
        case "3":
            import("../game3")
        default:
            console.log("noGame")
    }
}
