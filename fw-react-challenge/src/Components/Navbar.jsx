import { AppBar, Toolbar, Typography } from '@mui/material';

export default function Navbar() {
    return (
        <AppBar position="sticky">
            <Toolbar>
                <Typography
                    variant="h6"
                    component="a"
                    href="/"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 700,
                    }}
                >
                    Gravity - Challenge
                </Typography>
            </Toolbar>
        </AppBar>
    );
}
