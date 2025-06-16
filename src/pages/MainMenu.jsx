import { useNavigate } from 'react-router-dom';
import {Button} from '@mui/material';
import '../styles/MainStyles.css';

const MainMenu = () =>{
    const navigate = useNavigate();
    return (
        <div className="generic-centered-container">
            <div className="form-box">
                <h1 className="title-center">Main Menu</h1>
                <Button variant="contained" fullWidth onClick={() => navigate('/login/LogInOrgA')}>
                    Login as Org A
                </Button>
                <Button variant="outlined" fullWidth onClick={() => navigate('/login/LogInOrgB')}>
                    Login as Org B
                </Button>
            </div>
            
        </div>
    );
};
export default MainMenu