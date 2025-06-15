import { Routes, Route } from 'react-router-dom';
import MainMenu from './pages/MainMenu';
import LogInOrgA from './pages/login/LogInOrgA';
import LogInOrgB from './pages/login/LogInOrgB';
import './App.css'

function App() {
  return (
    <>
      <Routes>
        <Route path ="/" element={<MainMenu />}/>
        <Route path ="/login/LogInOrgA" element={<LogInOrgA />}/>
        <Route path ="/login/LogInOrgB" element={<LogInOrgB />}/>
      </Routes>
    </>
  )
}

export default App
