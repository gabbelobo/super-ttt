import React, { useEffect, useState } from 'react'
import socketIOClient from "socket.io-client";
import { useHistory } from 'react-router'
import { useAuth } from '../contexts/Auth'
import styles from '../styles/Main.module.scss'

const socket = socketIOClient(process.env.REACT_APP_API_URL);

const Main = () => {
  const { name } = useAuth()
  const [rooms, setRooms] = useState([])
  const history = useHistory()

  useEffect(() => {
    fetch(process.env.REACT_APP_API_URL + '/rooms')
      .then(res => res.json())
      .then(json => setRooms(json))
      .catch(e => {
        console.log(e);
      })
    socket.on("new room", data => {
      setRooms(curr => [...curr, data])
    })
    socket.on("remove room", data => {
      setRooms(curr => curr.filter(item => item !== data))
    })
    return () => socket.close()
  }, [])

  const handleJoin = (e) => {
    history.push('/room/' + e.target.id)
  }

  const handleCreateRoom = () => {
    history.push('/room')
  }

  return (
    <div className={styles.room_list}>
      <h1>Hi, {name}</h1>
      <h2>Available rooms: </h2>
      {rooms.length > 0 ?
        rooms.map((item, index) => (
          <div key={index}>
            <button onClick={handleJoin} id={item}>{item}</button>
          </div>
        )) :
        'No rooms!'
      }
      <div>
        <button onClick={handleCreateRoom}>Create room</button>
      </div>
    </div>
  )
}

export default Main
