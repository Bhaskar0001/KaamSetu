import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Use proxy
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        // Cache successful GET requests
        if (response.config.method === 'get') {
            try {
                const cacheKey = `API_CACHE_${response.config.url}`;
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: response.data,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.warn('Cache storage failed', e);
            }
        }
        return response;
    },
    (error) => {
        // Handle Offline / Network Error
        if (!error.response) { // Network Error usually has no response
            const config = error.config;
            if (config.method === 'get') {
                const cacheKey = `API_CACHE_${config.url}`;
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    // Return cached data as if it were a successful response
                    console.log(`[Offline] Serving cached data for ${config.url}`);
                    // return Promise.resolve({ ...data, isCached: true, cachedAt: timestamp });
                    // Axios expects a response object structure
                    return Promise.resolve({
                        data: data,
                        status: 200,
                        statusText: 'OK (Cached)',
                        headers: {},
                        confg: config,
                        isCached: true
                    });
                }
            }
        }

        if (error.response && error.response.status === 401) {
            // Auto-logout on 401
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
