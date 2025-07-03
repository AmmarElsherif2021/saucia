const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  // Handle empty responses
  if (response.status === 204 || !contentType) {
    return { success: true };
  }
  if (response.status === 401) {
    console.error('Authentication expired, logging out');
    localStorage.removeItem('jwt');
    window.location.reload();
  }
  // Parse response based on content type
  let responseBody;
  if (contentType?.includes('application/json')) {
    try {
      responseBody = await response.json();
    } catch (error) {
      throw new Error('Failed to parse JSON response');
    }
  } else {
    responseBody = { message: await response.text() };
  }

  // Handle errors
  if (!response.ok) {
    const errorMessage = responseBody.error || 
                        responseBody.message || 
                        `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return responseBody;
};

// Base HTTP client
export const httpClient = {
  async request(url, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Debug logging for requests
    if (process.env.NODE_ENV === 'development') {
      console.log('HTTP Request:', {
        method: config.method || 'GET',
        url,
        headers: config.headers,
        hasBody: !!config.body
      });
    }

    const response = await fetch(url, config);
    return handleResponse(response);
  },

  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  },

  post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  },
};

// Authenticated HTTP client
export const authClient = {
  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  },
  
  post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  },
  
  request(url, options = {}) {
    const token = localStorage.getItem('jwt');
    if (!token) {
      throw new Error('Authentication required - no token found');
    }
    
    return httpClient.request(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      }
    });
  }
};