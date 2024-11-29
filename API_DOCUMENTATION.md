# Staff Scheduling Platform API Documentation

This document provides detailed information about the API endpoints available in the Staff Scheduling Platform.

## Authentication

All API endpoints, except for signup and signin, require authentication. Include the authentication token in the `Authorization` header of your requests.

### Signup

- **URL**: `/api/auth/signup`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }

