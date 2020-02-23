import React, { useState, useEffect } from "react"

import firebase from "../../lib/firebase"

const Lobby = ({ lobbyId }) => {
    const [players, setPlayers] = useState([])

    useEffect(() => {
        const unsub = firebase.firestore().collection('lobbys').doc(lobbyId).onSnapshot(doc => {
            if (doc.exists) {
                setPlayers(doc.data().players)
            }
        })

        return () => {
            unsub()
        }
    }, [])

    return <>
        <div>welcome to {lobbyId}</div>
        {players.map(player => <div key={player}>{player}</div>)}
    </>
}

Lobby.getInitialProps = ctx => {
    return ctx.query
}

export default Lobby
