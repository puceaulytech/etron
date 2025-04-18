async function authenticatedFetch(endpoint, options = {}) {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken)
        throw new Error("No access token available. Please log in.");

    const fetchWithAuth = async () =>
        await apiFetch(endpoint, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });

    let response = await fetchWithAuth();

    // If token expired, attempt to refresh
    if (response.status === 401) {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken)
            throw new Error("No refresh token available. Please log in.");

        const refreshResponse = await apiFetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
            const { accessToken: newToken } = await refreshResponse.json();
            localStorage.setItem("accessToken", newToken);
            response = await fetchWithAuth(); // Retry original request with new token
        } else {
            // TODO: pop up message and log out user
            localStorage.clear();
            window.location.reload(); // I mean this kinda does the trick
            throw new Error("Session expired. Please log in again.");
        }
    }

    let responseBody;

    try {
        responseBody = await response.json();
    } catch (e) {
        responseBody = null;
    }

    if (!response.ok) {
        const error = new Error(`Request failed: ${response.status}`);
        error.code = responseBody.code;
        throw error;
    }
    return responseBody;
}
