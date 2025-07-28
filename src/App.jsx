import { Routes, Route } from 'react-router-dom';
import MainMenu from './pages/MainMenu';
import LogInOrgA from './pages/login/LogInOrgA';
import LogInOrgB from './pages/login/LogInOrgB';
import RegisterOrgA from './pages/register/RegisterOrgA';
import RegisterOrgB from './pages/register/RegisterOrgB';
import DashboardOrgA from './pages/dashboard/orgA/DashboardOrgA';
import DashboardOrgB from './pages/dashboard/orgB/DashboardOrgB';
import './styles/DashboardStyles.css';
import './styles/MainStyles.css';
import './styles/Register.css';

function App() {
  return (
    <>
      <Routes>
        <Route path ="/" element={<MainMenu />}/>
        <Route path ="/login/LogInOrgA" element={<LogInOrgA />}/>
        <Route path ="/login/LogInOrgB" element={<LogInOrgB />}/>
        <Route path ="/register/RegisterOrgA" element={<RegisterOrgA />}/>
        <Route path ="/register/RegisterOrgB" element={<RegisterOrgB />}/>
        <Route path="/dashboard/orgA/DashboardOrgA" element={<DashboardOrgA />} />
        <Route path="/dashboard/orgB/DashboardOrgB" element={<DashboardOrgB />} />
      </Routes>
    </>
  )
}

export default App
