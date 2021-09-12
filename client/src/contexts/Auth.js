import React, { createContext, useContext } from "react"
import useProvideAuth from "../hooks/useProvideAuth"

const AuthContext = createContext()

const ProvideAuth = ({ children }) => {
  const auth = useProvideAuth()
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  return useContext(AuthContext);
}

export { AuthContext, ProvideAuth, useAuth }