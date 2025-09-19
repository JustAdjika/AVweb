import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom';

import { Main } from './pages/main.tsx'
import { MenuPHN } from './layouts/menu_phone.tsx';

import './App.css'

function Works() {
  return (
    <h2 style={{ marginTop: '0px', paddingLeft: '70px', paddingTop: '10px' }}>В связи с грядущим ATP250 мы еще работаем над этими страницами, они будут реализованы позже</h2>
  )
}


function App() {
  type User = {
    id: number,
    IIN: string
  }

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

  const currentUser: User = {
    id: 3,
    IIN: '080104551740'
  }

  const [errorMessage, setErrorMessage] = useState<null | string>(null)


  return (
    screenSize.width < 766 ? (
      <>
        <MenuPHN user={currentUser} />
        <>
            {errorMessage && (
                <div className="error-message" style={{ zIndex: '1' }}>
                    {errorMessage}
                </div>
            )}
        </>
        <Routes>
          <Route path='/' element={<Main setErrorMessage={setErrorMessage}/>} />
          {/* <Route path='/auth/signin' element={<Main />} />
          <Route path='/auth/signup' element={<Main />} />
          <Route path='/auth/confirm' element={<Main />} />
          <Route path='/auth/recovery' element={<Main />} />
          <Route path='/user/:iin' element={<Main />} />
          <Route path='/masterRemote' element={<Main />} />
          <Route path='/event/:eventName' element={<Main />} />
          <Route path='/event/:eventName/register' element={<Main />} />
          <Route path='/event/:eventName/cms' element={<Main />} />
          <Route path='/event/:eventName/cms/requests' element={<Main />} />
          <Route path='/event/:eventName/map' element={<Main />} /> */}
          <Route path='/about' element={<Works />} />
          <Route path='/contacts' element={<Works />} />
          <Route path='/projects' element={<Works />} />
          <Route path="*" element={<h1 style={{ color: '#1A1A1A', margin: '0px', position: 'relative', top: '50px', left: '70px' }}>404. Page not found</h1>} />
        </Routes>
      </>
    ) : (
      <h2>Приносим извинения за неудобства, сайт оптимизирован только под мобильные устройства, мы работает над версию для планшетов и компьютеров </h2>
    )
  )
}

export default App
