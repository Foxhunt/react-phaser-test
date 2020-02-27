import { useState, useEffect } from "react"
import Peer from "simple-peer"

import firebase from "../firebase"

export default function usePeer(lobbyId, playerId) {
    const [peer, setPeer] = useState()
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        let unsub = () => {}
        let peer
        async function setupConnection() {
            const lobby = await firebase.firestore().collection("lobbys").doc(lobbyId).get()
            const isHost = lobby.data().hostId == playerId

            peer = new Peer({
                initiator: !isHost,
                config: {
                    iceServers: [{
                        urls: 'stun:stun.sipgate.net:3478'
                    }]
                }
            })

            peer.on('signal', data => {
                //write signal to DB
                firebase.firestore().collection('lobbys').doc(lobbyId).collection(isHost ? "hostSignal" : "playerSignal").add(data)
            })

            unsub = firebase.firestore().collection('lobbys').doc(lobbyId).collection(!isHost ? "hostSignal" : "playerSignal").onSnapshot(snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        peer.signal(change.doc.data())
                        change.doc.ref.delete()
                    }
                })
            })

            peer.on('connect', () => {
                setConnected(true)
            })

            peer.on("close", () => {
                setConnected(false)
            })

            peer.on("error", error => {
                setConnected(false)
            })

            setPeer(peer)
        }

        if (lobbyId && playerId) {
            setupConnection()
        }

        return () => {
            unsub()
            if(peer){
                peer.destroy()
                setConnected(false)
            }
        }
    }, [playerId])

    return [peer, connected]
}
