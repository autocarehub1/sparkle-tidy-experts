# Connection Issues Fix Documentation

## Problem
The application was experiencing "Could not connect to the server" errors when users tried to:
1. Submit the estimate calculator form
2. Schedule an appointment

## Root Causes
1. Multiple Node.js processes were running on the same port (5003)
2. Nodemon was crashing and restarting in an endless loop
3. No fallback mechanism for port conflicts
4. Limited retry logic in frontend components
5. No graceful shutdown of stale processes

## Solutions Implemented

### Backend Improvements
1. **Enhanced Port Management**:
   - Added explicit fallback ports configuration (5004, 5005)
   - Implemented a recursive port retry system
   - Better error logging for port conflicts

2. **Improved Process Handling**:
   - Added proper signal handling (SIGTERM, SIGINT)
   - Added graceful shutdown procedures
   - Force process termination after timeout
   - Proper MongoDB connection closure

3. **Email Configuration**:
   - Fixed Hostinger email setup (smtp.hostinger.com)
   - Added debug logging for connection issues
   - Improved TLS settings for compatibility

### Frontend Improvements
1. **Enhanced API Client**:
   - Added exponential backoff for retries
   - Implemented fallback URL mechanism
   - Added health check verification
   - Improved error handling and user messaging

2. **Component Error Handling**:
   - Simplified retry logic (delegated to Axios client)
   - Added more user-friendly error messages
   - Improved UI for connection errors
   - Used consistent styling across components

3. **CSS Improvements**:
   - Added `.error-container` with better styling
   - Improved retry button appearance
   - Better mobile responsiveness for error messages

## How to Fix Connection Issues

If you encounter "Could not connect to the server" errors in the future:

### 1. Check for port conflicts:
```bash
lsof -i:5003 | grep LISTEN
```

### 2. Kill stale processes:
```bash
kill -9 <PID>
```

### 3. Check for stalled nodemon processes:
```bash
ps aux | grep nodemon | grep -v grep
kill -9 <PID>
```

### 4. Restart the backend server:
```bash
cd backend && npm run dev
```

### 5. Verify the server is running:
```bash
curl http://localhost:5003/api/health
```

The health endpoint should return a JSON response with:
- status: "ok"
- database connection status
- email configuration status

### 6. If port 5003 is persistently unavailable:
The server will automatically try ports 5004 and 5005. Update the frontend configuration in `src/config.js` if you need to use a different port permanently.

## Preventing Future Issues

1. Always use the proper restart script when starting services
2. Ensure old processes are terminated before starting new ones
3. Keep the fallback port configuration up to date
4. Test both primary and fallback connections regularly
5. Follow the error logs for signs of port conflicts 