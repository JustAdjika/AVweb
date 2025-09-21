import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

import { Main } from './pages/main.tsx'
import { Signin } from './pages/signin.tsx';
import { Signup } from './pages/signup.tsx';
import { Confirm } from './pages/confirm.tsx';
import { Recovery } from './pages/recovery.tsx';
import { RecoveryLink } from './pages/recoveryLink.tsx';

import { MenuPHN } from './layouts/menu_phone.tsx';
import { request } from './serverRequest.ts';
import { errorLogger } from './errorLogger.ts';

import * as Types from '../module/types/types.ts'

import './App.css'

function Works() {
  return (
    <h2 style={{ marginTop: '0px', paddingLeft: '70px', paddingTop: '10px' }}>В связи с грядущим ATP250 мы еще работаем над этими страницами, они будут реализованы позже</h2>
  )
}


function App() {

  // Отслеживание размера экрана

  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  })


  // Отслеживание ошибки

  const [errorMessage, setErrorMessage] = useState<null | string>(null)


  // Сессия

  const location = useLocation();

  // const [session, setSession] = useState<Types.Session | null>(null)
  const [currentUser, setCurrentUser] = useState<Types.Account | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const cookie: string | undefined = Cookies.get("session")
        const userData: string | undefined = Cookies.get("userData")

        if(cookie && userData) {
          const parsedSession: Types.Session = JSON.parse(cookie) 
          const parsedUserData: { id: number } = JSON.parse(userData) 

          const res = await request({ 
            method: 'POST', 
            route: '/account/data/search', 
            loadQuery: { id: parsedUserData.id }, 
            loadData: {
              sessionId: parsedSession.id,
              sessionKey: parsedSession.key
            } 
          })

          if(res.status === 200) {
            const container = res.container as { data: Types.Account }
            
            setCurrentUser(container.data)
          } else errorLogger(setErrorMessage, res)
        }
      } catch (e: any) {
        const response = e.response
        errorLogger(setErrorMessage, { status: response.data.status, message: response.data.message })
      }

    })()
  }, [location.pathname])


  // Отслеживание /auth страниц
  const showLayout = !location.pathname.startsWith("/auth") && location.pathname !== '/passwordRecovery';

  return (
    screenSize.width < 766 ? (
      <>
        {showLayout ? <MenuPHN user={currentUser} /> : null }
        <>
            {errorMessage && (
                <div className="error-message" style={{ zIndex: '1' }}>
                    {errorMessage}
                </div>
            )}
        </>
        <Routes>
          <Route path='/' element={<Main setErrorMessage={setErrorMessage}/>} />
          <Route path='/auth/signin' element={<Signin setErrorMessage={setErrorMessage}/>} />
          <Route path='/auth/signup' element={<Signup setErrorMessage={setErrorMessage} />} />
          <Route path='/auth/confirm/:token' element={<Confirm setErrorMessage={setErrorMessage} />} />
          <Route path='/auth/recovery' element={<Recovery setErrorMessage={setErrorMessage} />} />
          <Route path='/passwordRecovery' element={<RecoveryLink setErrorMessage={setErrorMessage} />} />
          {/* // <Route path='/user/:iin' element={<Main />} />
          // <Route path='/masterRemote' element={<Main />} />
          // <Route path='/event/:eventName' element={<Main />} />
          // <Route path='/event/:eventName/register' element={<Main />} />
          // <Route path='/event/:eventName/cms' element={<Main />} />
          // <Route path='/event/:eventName/cms/requests' element={<Main />} />
          // <Route path='/event/:eventName/map' element={<Main />} /> */}
          <Route path='/about' element={<Works />} />
          <Route path='/contacts' element={<Works />} />
          <Route path='/projects' element={<Works />} />
          <Route path="/*" element={<h1 style={{ color: '#1A1A1A', margin: '0px', position: 'relative', top: '0px', left: '70px' }}>404. Page not found</h1>} />
        </Routes>
      </>
    ) : (
      <h2>Приносим извинения за неудобства, сайт оптимизирован только под мобильные устройства, мы работает над версию для планшетов и компьютеров </h2>
    )
  )
}

export default App
