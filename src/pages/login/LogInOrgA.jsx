import { TextField, Button } from '@mui/material';

const LogInOrgA = () => {
    return (
        <div className="generic-centered-container">
            <div className="form-box">
                <h1 className="title-center">Org A Log In</h1>
                <TextField label="Username" variant="outlined" fullWidth margin="normal" />
                <TextField label="Password" type="password" variant="outlined" fullWidth margin="normal" />
                <Button variant="contained" fullWidth>Log In</Button>
            </div>
        </div>
    );
};

export default LogInOrgA;
