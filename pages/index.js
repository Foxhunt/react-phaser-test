import React, { useEffect } from "react"

const Index = () => {
    // load Game
    useEffect(() => {
        import("../game").then(
            game => game.default()
        )
    }, [])

    return (
        <div id="phaser"/>
    )
}

export default Index
