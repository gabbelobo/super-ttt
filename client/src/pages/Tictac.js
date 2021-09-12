import React, { useState, useEffect } from 'react'
import socketIOClient from "socket.io-client";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styles from '../styles/Tictac.module.scss'
import checkResult from "../utils/checkResult";
import { useParams } from 'react-router'
import { useAuth } from '../contexts/Auth';
const socket = socketIOClient(process.env.REACT_APP_API_URL);
const Tictac = ({ newRoom }) => {
  const X = 'X'
  const O = 'O'
  const EMPTY_GRID = [['', '', ''], ['', '', ''], ['', '', '']]
  const DEFAULT_PIECES = [
    { value: '3', index: '1' },
    { value: '3', index: '2' },
    { value: '2', index: '1' },
    { value: '2', index: '2' },
    { value: '1', index: '1' },
    { value: '1', index: '2' },
  ]
  const STARTING_PLAYER = O
  let { id } = useParams()
  const { name } = useAuth()
  const [room, setRoom] = useState(null)
  const [grid, setGrid] = useState([...EMPTY_GRID])
  const [player, setPlayer] = useState(null)
  const [player2, setPlayer2] = useState(null)
  const [currentPlayer, setCurrentPlayer] = useState(STARTING_PLAYER)
  const [winner, setWinner] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [owner, setOwner] = useState(false)
  const [localScore, setLocalScore] = useState(0)
  const [networkScore, setNetworkScore] = useState(0)
  const [localPieces, setLocalPieces] = useState(DEFAULT_PIECES)
  const [netWorkPieces, setNetworkPieces] = useState(DEFAULT_PIECES)
  useEffect(() => {
    newRoom ? createRoom() : handleJoin(id)

    socket.on('joined', data => {
      setRoom(data.roomid)
      setPlayer2(data.partner)
      if (data.owner) {
        setPlayer(O)
        setOwner(true)
      } else {
        setPlayer(X)
        setOwner(false)
      }
      setPlaying(true)
      console.log('joined: ' + data.roomid + ' as ' + (data.owner ? O : X));
    })

    socket.on("play", (data) => {
      handleNetworkPlay(data)
    })
    socket.on("replay", () => {
      console.log('replay');
      handlePlayAgain()
    })

    socket.on('p2 join', name => {
      setPlayer2(name)
      setPlaying(true)
    })
    return () => socket.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!playing) return
    let result = checkResult(grid)
    if (result) {
      if (result === player) setLocalScore(curr => curr + 1)
      else if (result !== 'TIE') setNetworkScore(curr => curr + 1)
      setWinner(result)
      setPlaying(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid])

  const handleJoin = (room) => {
    socket.emit('join', { room, name })
  }

  const createRoom = () => {
    socket.emit('create', name)
  }

  const handlePlayAgain = () => {

    setGrid([['', '', ''], ['', '', ''], ['', '', '']])
    setGrid([['', '', ''], ['', '', ''], ['', '', '']])
    setWinner(null)
    setPlayer(current => {
      return (current === O ? X : O)
    })
    setCurrentPlayer(STARTING_PLAYER)
    setLocalPieces([
      { value: '3', index: '1' },
      { value: '3', index: '2' },
      { value: '2', index: '1' },
      { value: '2', index: '2' },
      { value: '1', index: '1' },
      { value: '1', index: '2' },
    ])
    setNetworkPieces([
      { value: '3', index: '1' },
      { value: '3', index: '2' },
      { value: '2', index: '1' },
      { value: '2', index: '2' },
      { value: '1', index: '1' },
      { value: '1', index: '2' },
    ])
    setPlaying(true)
  }
  const handleNetworkPlay = ({ row, col, value, index, play }) => {
    setGrid(current => {
      current[row][col] = {
        value,
        index,
        player: play
      }
      return [...current]
    })
    setNetworkPieces(current => (
      [...current.filter(piece => !(piece.value === value && piece.index === index))]
    ))
    const nextPlayer = (play === O ? X : O)
    setCurrentPlayer(nextPlayer)
  }

  const onDragEnd = result => {
    const { destination, draggableId } = result;
    // const pieceIndex = origin[1]
    // console.log(pieceValue, pieceIndex);
    if (!destination || destination.droppableId === 'options') {
      return;
    }
    const [pieceValue, pieceIndex] = draggableId.split('-')
    const [destRow, destCol] = destination.droppableId.split(',')

    if ((grid[destRow][destCol] === '' || (grid[destRow][destCol].value < pieceValue))
      && grid[destRow][destCol].player !== player
      && currentPlayer === player) {
      setGrid(current => {
        current[destRow][destCol] = {
          value: pieceValue,
          index: pieceIndex,
          player: player
        }
        return [...current]
      })
      setLocalPieces(current => (
        [...current.filter(piece => !(piece.value === pieceValue && piece.index === pieceIndex))]
      ))
      socket.emit('play', {
        row: destRow,
        col: destCol,
        value: pieceValue,
        index: pieceIndex,
        play: player
      })
      const nextPlayer = (player === O ? X : O)
      setCurrentPlayer(nextPlayer)
    }

  };
  return player2 ? (

    <div className={styles.main}>
      <h1>Room: {room}</h1>
      <h2>You {localScore} - {networkScore} {player2}</h2>

      {winner ?
        <h2>{winner === 'TIE' ? 'Tie!' : (winner === player ? name : player2) + ' won!'}</h2> :
        <h2>Current player is: {currentPlayer === player ? name : player2}</h2>}
      {(!playing && owner) &&
        <button
          onClick={() => {
            handlePlayAgain();
            socket.emit('replay', 'nice')
          }}
        >
          Play again
        </button>}
      {/* <div>
            {allMessages.map((msg, index) => <p key={index}>{msg}</p>)}
          </div>
          <form onSubmit={handleSendMessage}>
            <input type="text" value={message} onChange={e => setMessage(e.target.value)} />
            <button>Send</button>
          </form> */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.pieces}>
          {netWorkPieces.map((piece, index) => (
            <div key={index} className={styles.piece + ' ' + styles.network}>
              {piece.value}
            </div>
          ))}
        </div>
        <div className={styles.grid_container}>
          {grid.map((row, rowIndex) => (
            row.map((column, columnIndex) => (
              <Droppable
                droppableId={(rowIndex + ',' + columnIndex)}
                key={rowIndex + '-' + columnIndex}>
                {(provided) =>
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={styles.grid_item}
                  >
                    <div className={`${column.value ? styles.piece : ''}  ${(column.player === player) ? styles.local : styles.network}`}>
                      {column.value}
                    </div>
                    {provided.placeholder}
                  </div>
                }

              </Droppable>
            ))
          ))}
        </div>
        <Droppable droppableId={'options'}>
          {(provided) =>
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={styles.pieces}
            >
              {localPieces.map((piece, index) => (
                <Draggable
                  draggableId={piece.value + '-' + piece.index}
                  index={index}
                  key={(parseInt(piece.value) - 1) * 2 + (parseInt(piece.index) - 1)}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${styles.piece}`}
                    >
                      {piece.value}
                    </div>
                  )}

                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          }
        </Droppable>
        {/* <button onClick={()=> console.log(localPieces.map(piece => piece.value + '-' + piece.index))}>Log pieces ids</button> */}
      </DragDropContext>
    </div >
  ) :
    <div className={styles.main}>
      <h1>Room: {room}</h1>
      <p>Waiting for another player...</p>
    </div>
}

export default Tictac
