import React, { useState, useEffect } from "react"

import firebase from "../../lib/firebase"
import usePeer from "../../lib/hooks/usePeer"

const Lobby = ({ lobbyId }) => {
    const [playerId, setPlayerId] = useState(undefined)
    const [players, setPlayers] = useState([])
    const [peer, connected] = usePeer(lobbyId, playerId)

    // setup firebase subscriptions
    useEffect(() => {
        const unsub = firebase.firestore().collection('lobbys').doc(lobbyId).onSnapshot(doc => {
            if (doc.exists && doc.data().players) {
                setPlayers(doc.data().players)
            }
        })

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                setPlayerId(user.uid)
            }
        })

        return () => {
            unsub()
        }
    }, [])

    // join and leave lobby
    useEffect(() => {
        if (playerId) {
            firebase.firestore().collection('lobbys').doc(lobbyId).update({
                players: firebase.firestore.FieldValue.arrayUnion(firebase.auth().currentUser.uid),
                playerCount: firebase.firestore.FieldValue.increment(1)
            })
        }
        return () => {
            firebase.firestore().collection('lobbys').doc(lobbyId).update({
                players: firebase.firestore.FieldValue.arrayRemove(firebase.auth().currentUser.uid),
                playerCount: firebase.firestore.FieldValue.increment(-1)
            })
        }
    }, [playerId])

    // load and setup game
    useEffect(() => {
        async function loadGame() {
            if (connected) {
                const module = await import("../../game")
                module.default(peer)
            }
        }
        loadGame()
    }, [connected])

    return <>
        <div>playerId {playerId}</div>
        <div>lobbyId {lobbyId}</div>
        <div>{connected ? "" : "not "} connected</div>
        {players.map(player => <div key={player}>{player}</div>)}
        <div id="phaser" />
    </>
}

Lobby.getInitialProps = ctx => {
    return ctx.query
}

export default Lobby
