import React, { useEffect, useState } from 'react'
import socketIOClient from "socket.io-client";
import { useHistory } from 'react-router'
import { useAuth } from '../contexts/Auth'
import styles from '../styles/Main.module.scss'
import { MdCheck, MdPerson, MdKeyboardArrowRight } from 'react-icons/md'

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
    return () => socket.disconnect()
  }, [])

  const handleJoin = (id) => {

    history.push('/room/' + id)
  }

  const handleCreateRoom = () => {
    history.push('/room')
  }

  return (
    <div className={styles.main}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Hi, {name}</h1>
        </div>
        <div className={styles.room_list}>
          <h2>Available rooms: </h2>
          {rooms.length > 0 ?
            rooms.map((item, index) => (
              <div key={index} className={styles.room} onClick={()=>handleJoin(item)}>
                <div className={styles.title}> <MdPerson /> {item}'s room </div>
                <div className={styles.join}><MdCheck size="1.5em" /></div>
              </div>
            )) :
            'No rooms!'
          }

        </div>
        <div className={styles.other}>
          <div className={styles.create}>
            <div className={styles.title} onClick={handleCreateRoom}>CREATE ROOM</div>
            <div className={styles.arrows}><MdKeyboardArrowRight size={"1.5em"}/></div>
          </div>
        </div>

      </div>

    </div>

  )
}

export default Main
