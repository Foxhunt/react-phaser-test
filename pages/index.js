import React, { useEffect } from "react"

const Index = () => {
    // load Game
    useEffect(() => {
        import("../game")
    }, [])

    return (
        <div id="phaser"/>
    )
}

export default Index
