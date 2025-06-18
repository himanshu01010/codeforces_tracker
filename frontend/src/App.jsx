import { useState ,useEffect} from 'react'
import {BrowserRouter ,Routes,Route } from 'react-router-dom'
import StudentTable from './components/StudentTable'
import StudentProfile from './components/StudentProfile'
import Settings from './components/Settings'
import Navbar from './components/Navbar'


function App() {
  const [darkMode,setDarkMode] = useState(()=>{
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(()=>{
    localStorage.setItem('darkMode',JSON.stringify(darkMode))
    if(darkMode){
      document.documentElement.classList.add('dark')
    }
    else{
      document.documentElement.classList.remove('dark')
    }
  },[darkMode])

  const toggleDarkMode = ()=>{
    setDarkMode(!darkMode)
  }

  return (
    <BrowserRouter>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<StudentTable />} />
          <Route path="/student/:id" element={<StudentProfile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
    </BrowserRouter>
  )
}

export default App
