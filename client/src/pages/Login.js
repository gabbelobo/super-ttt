import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import styles from '../styles/Login.module.scss'
import { useAuth } from '../contexts/Auth'

const Login = () => {
  const history = useHistory()
  // eslint-disable-next-line no-unused-vars
  const { name, getName } = useAuth()
  const [_name, setName] = useState('')
  useEffect(() => {
    console.log('Name on login page: ' + name);
  }, [name])
  const handleLogin = (e) => {
    console.log('name on login page: ' + name);
    e.preventDefault()
    if (_name && _name !== '') {
      localStorage.setItem('name', _name)
      getName()
      history.push('/')
    }
  }
  return (
    <div className={styles.login}>
      <div className={styles.card}>
        <div className={styles.banner}>
          <h1>Super Tic Tac Toe</h1>
        </div>
        <form onSubmit={handleLogin}>
          <label htmlFor="">Please enter your name:</label>
          <input type="text" value={_name} onChange={e => setName(e.target.value)} />
          <button>Submit</button>
        </form>
        <a
          href="https://gabriel.lofgren.com.br"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made by Gabriel Lobo
        </a>

      </div>

    </div>
  )
}

export default Login
