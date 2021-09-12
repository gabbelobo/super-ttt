import { useEffect, useState } from 'react'

const useProvideAuth = () => {
  const [name, setName] = useState(localStorage.getItem('name'))
  useEffect(() => {
    getName()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getName = () => {
    if (localStorage.getItem('name')) {
      setName(localStorage.getItem('name'))
    }
  }

  return { name, getName }
}

export default useProvideAuth
