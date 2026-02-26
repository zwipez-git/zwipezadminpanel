import {BrowserRouter,Route,Routes} from 'react-router-dom'
import Admin from './pages/Admin'
import Login from './pages/Login'

function App() {
  return (
    <>
     <BrowserRouter>
    <Routes>

      < Route path="/" element={<Login/>}/>
      < Route path="/login" element={<Login/>}/>
   
      < Route path="/admin" element={<Admin/>}/>


    </Routes>
    
    
    </BrowserRouter>
   </>
  )
}

export default App