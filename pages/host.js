import Peer from "simple-peer"
import React, { useEffect, useState } from "react"

import firebase from "../lib/firebase"

const Host = () => {
    const [down, setDown] = useState(false)
    const [peerDown, setPeerDown] = useState(false)

    useEffect(() => {
        const peer = new Peer({
            initiator: false
        })

        peer.on('signal', data => {
            //write signal to DB
            firebase.firestore().collection('lobby').doc("host").set(data)
        })

        peer.on('connect', () => {
            // wait for 'connect' event before using the data channel
            peer.send("Hello from Host")
            window.addEventListener("pointerdown", event => {
                setDown(true)
                peer.send("down")
            })
            window.addEventListener("pointerup", event => {
                setDown(false)
                peer.send("up")
            })
        })

        peer.on("close", () => {
            console.log("peer closed")
        })

        peer.on("error", error => {
            console.error(error)
        })

        peer.on("data", data => {
            console.log(data.toString())
            setPeerDown(data.toString() === "down")
        })

        firebase.firestore().collection('lobby').doc("client").onSnapshot(doc => {
            if(doc.exists){
                peer.signal(doc.data())
                console.log("client snapshot")
            }
        })
    }, [])

    return <>
        <div>self {down ? "down" : "up"}</div>
        <div>peer {peerDown ? "down" : "up"}</div>
    </>
}

export default Host
