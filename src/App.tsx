import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';

import { Main } from './pages/main.tsx'
import { Signin } from './pages/signin.tsx';
import { Signup } from './pages/signup.tsx';
import { Confirm } from './pages/confirm.tsx';
import { Recovery } from './pages/recovery.tsx';
import { RecoveryLink } from './pages/recoveryLink.tsx';
import { Profile } from './pages/profile.tsx';
import { Event } from './pages/event.tsx';
import { EventRegister } from './pages/eventRegister.tsx';
import { EventCMS } from './pages/eventCMS.tsx';

import { MenuPHN } from './layouts/menu_phone.tsx';
import { ATPMenuPHN } from './layouts/ATPmenu_phone.tsx';
import { CMSMenuPHN } from './layouts/CMSmenu_phone.tsx';
import { getUser } from './module/getUser.ts';

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

  const [currentUser, setCurrentUser] = useState<Types.Account | null>(null)

  useEffect(() => {
    (async () => {

      const gotData = await getUser({ setErrorMessage })

      if(gotData) setCurrentUser(gotData)

    })()
  }, [location.pathname])


  // Отслеживание страниц
  const showLayout = 
    !location.pathname.startsWith("/auth") && 
    location.pathname !== '/passwordRecovery' && 
    location.pathname !== '/event/atp250/register'
  const menu = 
    localStorage.getItem("lastStage") === 'ATP' ? <ATPMenuPHN user={currentUser} /> : 
    localStorage.getItem("lastStage") === 'ATP_CMS' ? <CMSMenuPHN user={currentUser} /> :
    <MenuPHN user={currentUser}/>


  // Последний раздел сайта 

  useEffect(() => {
    if(location.pathname.startsWith("/user")) return
    if(location.pathname.startsWith("/event/atp250/cms")) localStorage.setItem("lastStage", 'ATP_CMS')
    else if(location.pathname.startsWith("/event/atp250") && !location.pathname.startsWith("/event/atp250/cms")) localStorage.setItem("lastStage", 'ATP')
    else localStorage.setItem("lastStage", 'main')
  }, [location.pathname]) 

  return (
    screenSize.width < 700 || location.pathname.startsWith('/event/atp250/cms') && screenSize.width < 2024 ? (
      <>
        {showLayout ? menu : null }
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
          <Route path='/user/:iin' element={<Profile setErrorMessage={setErrorMessage} />} />
          <Route path='/event/atp250' element={<Event setErrorMessage={setErrorMessage}/>} />
          <Route path='/event/:eventName/register' element={<EventRegister setErrorMessage={setErrorMessage} />} />
          <Route path='/event/:eventName/cms' element={<EventCMS setErrorMessage={setErrorMessage} />} />
          {/* <Route path='/event/:eventName/cms/requests' element={<Main />} />
          <Route path='/event/:eventName/map' element={<Main />} />
          <Route path='/masterRemote' element={<Main />} /> */}
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
