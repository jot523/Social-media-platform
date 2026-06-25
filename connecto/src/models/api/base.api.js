/**
 * Base API Service
 * Provides common HTTP methods and error handling for all API services
 */

class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

class BaseAPI {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Get headers with auth token — skip mock tokens
  getHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();
    
    // Send Authorization header if token is present
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Build full URL
  buildURL(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  // Handle API response
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new APIError(
        data?.message || `HTTP Error: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  }

  // Generic request method
  async request(method, endpoint, options = {}) {
    const url = this.buildURL(endpoint);
    const config = {
      method,
      headers: this.getHeaders(options.headers),
      ...options,
    };

    // Add body for POST, PUT, PATCH requests
    if (options.body && method !== 'GET') {
      if (options.body instanceof FormData) {
        // Remove Content-Type header for FormData (browser will set it)
        delete config.headers['Content-Type'];
        config.body = options.body;
      } else {
        config.body = JSON.stringify(options.body);
      }
    }

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or other errors
      throw new APIError(
        error.message || 'Network error occurred',
        0,
        null
      );
    }
  }

  // HTTP Methods
  async get(endpoint, params = {}, options = {}) {
    const url = new URL(this.buildURL(endpoint), window.location.origin);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    return this.request('GET', endpoint + url.search, options);
  }

  async post(endpoint, body = null, options = {}) {
    return this.request('POST', endpoint, { ...options, body });
  }

  async put(endpoint, body = null, options = {}) {
    return this.request('PUT', endpoint, { ...options, body });
  }

  async patch(endpoint, body = null, options = {}) {
    return this.request('PATCH', endpoint, { ...options, body });
  }

  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }

  // File upload method
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional form data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.post(endpoint, formData);
  }

  // Batch request method
  async batch(requests) {
    const promises = requests.map(({ method, endpoint, body, options }) => {
      return this.request(method, endpoint, { ...options, body });
    });

    try {
      return await Promise.allSettled(promises);
    } catch (error) {
      throw new APIError('Batch request failed', 0, error);
    }
  }

  // Retry mechanism for failed requests
  async retryRequest(requestFn, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Wait before retrying
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }

    throw lastError;
  }

  // Cache management (simple in-memory cache)
  static cache = new Map();
  static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getCached(key, fetchFn, ttl = BaseAPI.cacheTimeout) {
    const cached = BaseAPI.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const data = await fetchFn();
    BaseAPI.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  clearCache(pattern = null) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of BaseAPI.cache.keys()) {
        if (regex.test(key)) {
          BaseAPI.cache.delete(key);
        }
      }
    } else {
      BaseAPI.cache.clear();
    }
  }

  // Request interceptors
  static requestInterceptors = [];
  static responseInterceptors = [];

  static addRequestInterceptor(interceptor) {
    BaseAPI.requestInterceptors.push(interceptor);
  }

  static addResponseInterceptor(interceptor) {
    BaseAPI.responseInterceptors.push(interceptor);
  }

  // Apply request interceptors
  async applyRequestInterceptors(config) {
    let modifiedConfig = config;
    
    for (const interceptor of BaseAPI.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    
    return modifiedConfig;
  }

  // Apply response interceptors
  async applyResponseInterceptors(response) {
    let modifiedResponse = response;
    
    for (const interceptor of BaseAPI.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    
    return modifiedResponse;
  }
}

// Create singleton instance
const apiClient = new BaseAPI('/api');

// Add default request interceptor for logging
BaseAPI.addRequestInterceptor(async (config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`API Request: ${config.method} ${config.url}`);
  }
  return config;
});

// Add default response interceptor for error handling
BaseAPI.addResponseInterceptor(async (response) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`API Response: ${response.status}`);
  }
  return response;
});

export { BaseAPI, APIError, apiClient };
export default BaseAPI;