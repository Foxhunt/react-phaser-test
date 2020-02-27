import React, { useState, useEffect } from "react"
import Router from "next/router"

import firebase from "../lib/firebase"

function createLobby(name) {
    const lobby = {
        name,
        hostId: firebase.auth().currentUser.uid,
        timeStamp: new Date()
    }

    return firebase.firestore().collection('lobbys').add(lobby)
}

function deleteLobby(id) {
    firebase.firestore().collection('lobbys').doc(id).delete()
}

const Index = () => {
    const [lobbyName, setLobbyName] = useState("")
    const [lobbys, setLobbys] = useState([])

    useEffect(() => {
        const unsub = firebase.firestore().collection('lobbys')
            .where("playerCount", "<", 2)
            .orderBy("playerCount")
            .orderBy("timeStamp", "desc")
            .onSnapshot(snapshot => {
                const lobbys = []
                snapshot.forEach(doc => lobbys.push([doc.id, doc.data()]))
                setLobbys(lobbys)
            })

        return () => {
            unsub()
        }
    }, [])

    return <>
        <form
            onSubmit={async event => {
                event.preventDefault()
                const newLobby = await createLobby(lobbyName)
                Router.push("/lobby/[lobbyId]", `/lobby/${newLobby.id}`)
            }}>
            <input
                onChange={event => {
                    setLobbyName(event.target.value)
                }}
            />
            <button>create</button>
        </form>
        {
            lobbys.map(([id, lobby]) =>
                <div
                    key={id}>
                    {`${lobby.name}`}
                    <button
                        onClick={() => {
                            deleteLobby(id)
                        }}>
                        delete
                        </button>
                    <button
                        onClick={() => {
                            Router.push("/lobby/[lobbyId]", `/lobby/${id}`)
                        }}>
                        join
                    </button>
                </div>)
        }
    </>
}

export default Index
