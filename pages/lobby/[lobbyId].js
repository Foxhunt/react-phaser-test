import React, { useState, useEffect } from "react"

import firebase from "../../lib/firebase"
import usePeer from "../../lib/hooks/usePeer"

const Lobby = ({ lobbyId }) => {
    const [down, setDown] = useState(false)
    const [peerDown, setPeerDown] = useState(false)
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

    // setup pointer events
    useEffect(() => {
        function onPointerDown() {
            setDown(true)
        }

        function onPointerUp() {
            setDown(false)
        }

        window.addEventListener("pointerdown", onPointerDown)
        window.addEventListener("pointerup", onPointerUp)

        return () => {
            window.removeEventListener("pointerdown", onPointerDown)
            window.removeEventListener("pointerup", onPointerUp)
        }
    }, [])

    // set PeerDown state
    useEffect(() => {
        function onData(data) {
            setPeerDown(data.toString() === "down")
        }
        if (peer) {
            peer.on("data", onData)
        }
        return () => {
            if (peer) {
                peer.removeListener("data", onData)
            }
        }
    }, [peer])

    // send down state
    useEffect(() => {
        if (connected) {
            // peer.send(down ? "down" : "up")
        }
    }, [connected, down])

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
        <div>self {down ? "down" : "up"}</div>
        <div>peer {peerDown ? "down" : "up"}</div>
        {players.map(player => <div key={player}>{player}</div>)}
        <div id="phaser" />
    </>
}

Lobby.getInitialProps = ctx => {
    return ctx.query
}

export default Lobby
