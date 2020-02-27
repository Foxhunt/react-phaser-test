import { useState, useEffect } from "react"
import Peer from "simple-peer"

import firebase from "../firebase"

export default function usePeer(lobbyId, playerId) {
    const [peer, setPeer] = useState()
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        let unsub = () => { }

        function handleSignal(signal) {
            //write signal to DB
            firebase.firestore().collection('lobbys').doc(lobbyId).collection(isHost ? "hostSignal" : "playerSignal").add(signal)
        }

        function handleConnect() {
            setConnected(true)
            unsub()
        }

        function handleClose() {
            setConnected(false)
            console.log("close")
        }

        function handleError(error) {
            setConnected(false)
            console.error(error)
        }

        async function setupConnection() {
            const lobby = await firebase.firestore().collection("lobbys").doc(lobbyId).get()
            const isHost = lobby.data().hostId == playerId

            const peer = new Peer({
                initiator: !isHost,
                config: {
                    iceServers: [{
                        urls: 'stun:stun.sipgate.net:3478'
                    }]
                }
            })

            peer.on('signal', handleSignal)

            unsub = firebase.firestore().collection('lobbys').doc(lobbyId).collection(!isHost ? "hostSignal" : "playerSignal").onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        peer.signal(change.doc.data())
                        change.doc.ref.delete()
                    }
                })
            })

            peer.on('connect', handleConnect)

            peer.on("close", handleClose)

            peer.on("error", handleError)

            setPeer(peer)
        }

        if (lobbyId && playerId && !connected) {
            setupConnection()
        }

        return () => {
            unsub()
            if (connected) {
                peer.removeListener('signal', handleSignal)
                peer.removeListener('connect', handleConnect)
                peer.removeListener("close", handleClose)
                peer.removeListener("error", handleError)
            }
        }
    }, [playerId, connected])

    return [peer, connected]
}
