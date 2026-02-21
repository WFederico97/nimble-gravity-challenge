import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useState } from 'react';
import { getApplicantData, getOpenPositions, postApplication } from '../Services/ApiService';

const WARNING_MSG = 'Before applying to any of the open vacancies, you must search for the applicant data by email.';

export default function VacancyTable() {
    // Applicant search state
    const [applicantEmail, setApplicantEmail] = useState('');
    const [applicantData, setApplicantData] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Positions state
    const [positions, setPositions] = useState([]);
    const [isLoadingPositions, setIsLoadingPositions] = useState(true);

    // Application submission state
    const [repoUrls, setRepoUrls] = useState({});
    const [submittingRowId, setSubmittingRowId] = useState(null);

    // Notification state
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const clearNotifications = () => {
        setError(null);
        setSuccessMsg(null);
    };

    const handleRepoChange = (rowId, value) => {
        setRepoUrls((prev) => ({ ...prev, [rowId]: value }));
    };

    const handleApply = async (row) => {
        const repoUrl = (repoUrls[row.id] || '').trim();
        if (!repoUrl) {
            setError('Please enter a repository URL before submitting.');
            return;
        }
        if (!applicantData?.uuid) {
            setError('Search for an applicant first.');
            return;
        }

        const body = {
            uuid: applicantData.uuid,
            applicationId: applicantData.applicationId,
            jobId: row.id,
            candidateId: applicantData.candidateId,
            repoUrl,
        };

        setSubmittingRowId(row.id);
        clearNotifications();

        try {
            await postApplication(body);
            setSuccessMsg(`Application for "${row.title}" submitted successfully.`);
        } catch (err) {
            setError(err.message || `Failed to submit application for "${row.title}".`);
        } finally {
            setSubmittingRowId(null);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 200 },
        { field: 'title', headerName: 'TITLE', width: 300 },
        {
            field: 'repo',
            headerName: 'REPO URL',
            width: 300,
            sortable: false,
            renderCell: (params) => (
                <TextField
                    size="small"
                    variant="outlined"
                    placeholder="https://github.com/..."
                    value={repoUrls[params.row.id] || ''}
                    onChange={(e) => handleRepoChange(params.row.id, e.target.value)}
                    fullWidth
                />
            ),
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 180,
            sortable: false,
            renderCell: (params) => {
                const isSubmitting = submittingRowId === params.row.id;
                return (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                        onClick={() => handleApply(params.row)}
                        disabled={!hasSearched || isSubmitting}
                    >
                        {isSubmitting ? 'Sending...' : 'Submit'}
                    </Button>
                );
            },
        },
    ];

    const handleSearch = async () => {
        const trimmedEmail = applicantEmail.trim();
        if (!trimmedEmail) {
            setError('Please enter an email to search for applicant data.');
            return;
        }

        setIsSearching(true);
        clearNotifications();

        try {
            const result = await getApplicantData(trimmedEmail);
            setApplicantData(result);
            setHasSearched(true);
            setSuccessMsg('Applicant data loaded successfully.');
        } catch (err) {
            setError(err.message || 'Error retrieving applicant data.');
            setApplicantData(null);
            setHasSearched(false);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        let cancelled = false;

        const fetchPositions = async () => {
            setIsLoadingPositions(true);
            try {
                const data = await getOpenPositions();
                if (!cancelled) setPositions(data);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Error fetching open positions.');
            } finally {
                if (!cancelled) setIsLoadingPositions(false);
            }
        };

        fetchPositions();
        return () => { cancelled = true; };
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography
                    variant="h3"
                    component="h1"
                    align="center"
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 4 }}
                >
                    Gravity Vacancies List
                </Typography>

                {!hasSearched && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        {WARNING_MSG}
                    </Alert>
                )}

                <Box
                    sx={{
                        backgroundColor: 'white',
                        p: 3,
                        borderRadius: 2,
                        boxShadow: 2,
                        mb: 4,
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Applicant email"
                            placeholder="e.g. applicant@example.com"
                            variant="outlined"
                            value={applicantEmail}
                            onChange={(e) => setApplicantEmail(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            disabled={isSearching}
                        />
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={isSearching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                            onClick={handleSearch}
                            disabled={isSearching}
                            sx={{ minWidth: 120 }}
                        >
                            Search
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {successMsg && (
                    <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg(null)}>
                        {successMsg}
                    </Alert>
                )}

                <DataGrid
                    rows={positions}
                    columns={columns}
                    loading={isLoadingPositions}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 5 },
                        },
                    }}
                    pageSizeOptions={[5]}
                    disableRowSelectionOnClick
                    autoHeight
                />
            </Container>
        </Box>
    );
}
