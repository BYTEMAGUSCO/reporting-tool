import { useNavigate } from 'react-router-dom';
import {Button} from '@mui/material';
import '../styles/MainStyles.css';

const MainMenu = () =>{
    const navigate = useNavigate();
    return (
        <div>
            <span><h1>Main Menu</h1></span>
            <div className="generic-centered-container">
                <Button variant="contained" onClick={() => navigate('/login/LogInOrgA')}>
                    Login as Org A
                </Button>
                <Button variant="outlined" onClick={() => navigate('/login/LogInOrgB')}>
                    Login as Org B
                </Button>
            </div>
        </div> 
    );
};
export default MainMenu