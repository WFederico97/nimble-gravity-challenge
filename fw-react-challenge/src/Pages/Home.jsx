import Navbar from '../Components/Navbar';
import VacancyTable from '../Components/Table';
import { Box } from '@mui/material';

export default function Home() {
    return (
        <Box>
            <Navbar />
            <VacancyTable />
        </Box>
    );
}
