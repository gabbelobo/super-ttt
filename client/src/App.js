import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import styles from './styles/Tictac.module.scss'
import checkResult from "./utils/checkResult";
const ENDPOINT = process.env.REACT_APP_API_URL;
const socket = socketIOClient(ENDPOINT);
function App() {
  // const [allMessages, setAllMessages] = useState([])
  // const [message, setMessage] = useState("")
  const X = 'X'
  const O = 'O'
  const EMPTY_GRID = [['', '', ''], ['', '', ''], ['', '', '']]
  // const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false)
  const [rooms, setRooms] = useState([])
  const [room, setRoom] = useState(null)
  const [grid, setGrid] = useState([...EMPTY_GRID])
  const [player, setPlayer] = useState(null)
  const [currentPlayer, setCurrentPlayer] = useState(X)
  const [winner, setWinner] = useState(null)
  const [playing, setPlaying] = useState(true)
  const [owner, setOwner] = useState(false)
  const [localScore, setLocalScore] = useState(0)
  const [networkScore, setNetworkScore] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => {
    fetch(ENDPOINT + '/rooms')
      .then(res => res.json())
      .then(json => setRooms(json))
      .catch(e => {
        console.log(e);
        setError(e.responseText)
      })
    
    // setSocket(newSocket)
    // newSocket.on("new message", data => {
    //   console.log('got message: ' + data);
    //   setAllMessages(current => [...current, data])
    // });
    socket.on("new room", data => {
      setRooms(curr => [...curr, data])
    })
    socket.on("remove room", data => {
      setRooms(curr => curr.filter(item => item !== data))
    })
    socket.on('joined', data => {
      setRoom(data.roomid)
      setConnected(true)
      if(data.owner){
        setPlayer(O)
        setOwner(true)
      }else {
        setPlayer(X)
        setOwner(false)
      } 
      console.log('joined: ' + data.roomid + ' as ' + (data.owner ? O : X));
    })

    socket.on("play", ({ row, column, player }) => {
      handlePlayGrid(row, column, player)
    })
    socket.on("replay", () => {
      console.log('replay');
      handlePlayAgain()
    })
    return () => socket.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(()=> {
    if(!playing) return
    let result = checkResult(grid)
    if(result) {
      if(result === player) setLocalScore(curr => curr +  1)
      else if (result !== 'TIE') setNetworkScore(curr => curr + 1)
      setWinner(result)
      setPlaying(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[grid])

  const handleJoin = (e) => {
    socket.emit('join', { room: e.target.id })
  }

  const createRoom = () => {
    socket.emit('create')
  }

  const handlePlayGrid = (row, column, _player = false) => {
    if (!_player) socket.emit('play', { row, column, player: player })
    const play = _player ? _player : player
    setGrid(current => {
      current[row][column] = play
      return [...current]
    })
    const nextPlayer = (play === O ? X : O)
    setCurrentPlayer(nextPlayer)
  }

  const handlePlayAgain = () => {
 
    setGrid(() => [['', '', ''], ['', '', ''], ['', '', '']])
    setWinner(null)
    setPlayer(current => {
      return (current === O ? X : O)
    })
    setPlaying(true)
  }

  return (
    <div>
      {connected ?
        <>
          <h1>Room: {room}</h1>
          <h2>You are: {player}</h2>
          <h2>You {localScore} - {networkScore} They</h2>
          {winner ? <h2>{winner === 'TIE' ? 'Tie!' : winner + ' won!'}</h2> : <h2>Current player is: {currentPlayer}</h2>}
          {(!playing && owner) && <button onClick={()=> {handlePlayAgain(); socket.emit('replay', 'nice')}}>Play again</button>}
          {/* <div>
            {allMessages.map((msg, index) => <p key={index}>{msg}</p>)}
          </div>
          <form onSubmit={handleSendMessage}>
            <input type="text" value={message} onChange={e => setMessage(e.target.value)} />
            <button>Send</button>
          </form> */}
          <div className={styles.grid_container}>
            {grid.map((row, rowIndex) => (
              row.map((column, columnIndex) => (
                <div
                  key={rowIndex + '-' + columnIndex}
                  onClick={() => {
                    if(currentPlayer === player && playing && !grid[rowIndex][columnIndex]){
                      handlePlayGrid(rowIndex, columnIndex)
                    }
                    
                  }}
                  className={styles.grid_item}
                >
                  {column}
                </div>
              ))
            ))}
          </div>
          
        </>
        :
        <div className={styles.room_list}>
          <h2>Availble rooms: </h2>
          { rooms.length > 0 ?
            rooms.map((item, index) => (
              <div key={index}>
                <button onClick={handleJoin}  id={item}>{item}</button>
              </div>
            )) :
            'No rooms!'
          }
          <div>
            <button onClick={createRoom}>Create room</button>
          </div>
          <p>{error}</p>
        </div>
        
      }
    </div>

  );
}

export default App;