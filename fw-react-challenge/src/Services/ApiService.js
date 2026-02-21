import axios, { isAxiosError } from 'axios';

const API_BASE_URL = 'https://botfilter-h5ddh6dye8exb7ha.centralus-01.azurewebsites.net';

/**
 * Fetches applicant data by email.
 * @param {string} applicantEmail
 * @returns {Promise<Object>} Applicant record
 */
export const getApplicantData = async (applicantEmail) => {
    try {
        const encodedEmail = encodeURIComponent(applicantEmail);
        const response = await axios.get(`${API_BASE_URL}/api/candidate/get-by-email?email=${encodedEmail}`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching applicant data (${error.response?.status ?? 'network error'})`);
        }
        throw error;
    }
};

/**
 * Fetches all open job positions.
 * @returns {Promise<Array>} List of positions
 */
export const getOpenPositions = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/jobs/get-list`);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error fetching open positions (${error.response?.status ?? 'network error'})`);
        }
        throw error;
    }
};

/**
 * Submits a job application.
 * @param {Object} body - Application payload
 * @returns {Promise<Object>} Response data
 */
export const postApplication = async (body) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/candidate/apply-to-job`, body);
        return response.data;
    } catch (error) {
        if (isAxiosError(error)) {
            throw new Error(`Error submitting application (${error.response?.status ?? 'network error'})`);
        }
        throw error;
    }
};
