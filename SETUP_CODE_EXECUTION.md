# Code Execution Setup - Piston API

## Overview
The IDE uses **Piston API** for secure, multi-language code execution. All code runs remotely on the Piston servers.

## Architecture

```
Frontend (React)
    ↓
POST /api/execute/run
    ↓
Backend Express Server
    ↓
Piston API (emkc.org)
    ↓
Returns: { output, error, executionTime }
    ↓
Frontend displays results
```

## Features

✅ **Multi-Language Support**
- JavaScript (18.15.0)
- Python (3.10.0)
- C++ (10.2.0)
- TypeScript (5.0.3)
- Java (15.0.2)
- C# (6.12.0)
- C (10.2.0)

✅ **Error Handling**
- 400: Invalid request (bad code, unsupported language)
- 401/503: Piston API unavailable
- 429: Rate limit exceeded
- 500: Internal server error

✅ **Execution Features**
- Standard input (stdin) support
- Standard output (stdout) capture
- Standard error (stderr) capture
- 10-second execution timeout
- Execution time tracking

## Setup

### 1. Backend Setup
No additional setup needed! The backend is configured to forward to Piston.

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables
Ensure `.env` in frontend has:
```env
VITE_BACKEND_URL=http://localhost:8080
```

## API Endpoint

### POST `/api/execute/run`

**Request:**
```json
{
  "code": "print('hello world')",
  "language": "python",
  "input": ""
}
```

**Successful Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "output": "hello world\n",
    "error": "",
    "executionTime": 234,
    "language": "python"
  }
}
```

**Runtime Error Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "output": "",
    "error": "NameError: name 'x' is not defined",
    "executionTime": 45,
    "language": "python"
  }
}
```

**API Error Response (400/500):**
```json
{
  "success": false,
  "message": "Language 'rust' is not supported",
  "error": "...",
  "data": {
    "success": false,
    "output": "",
    "error": "...",
    "executionTime": 0,
    "language": "unknown"
  }
}
```

## Testing

### From Frontend UI
1. Open Code IDE
2. Create a file (e.g., `test.py`)
3. Write code:
   ```python
   print("Hello from Piston!")
   ```
4. Click **Run**
5. See output in terminal

### With cURL
```bash
curl -X POST http://localhost:8080/api/execute/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "code": "console.log(\"Hello Piston!\")",
    "language": "javascript",
    "input": ""
  }'
```

### Test Endpoint
```bash
curl -X GET http://localhost:8080/api/execute/test
```

This runs a test JavaScript hello world.

## Code Execution Examples

### JavaScript with Input
```javascript
// Code
const name = prompt("Enter name: ");
console.log("Hello, " + name);

// Terminal Input:
// Alice
```

### Python with Input
```python
x = int(input("Enter a number: "))
print(f"Square: {x ** 2}")

# Terminal Input:
# 5
```

### C++ with Input
```cpp
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << "Sum: " << (a + b) << endl;
    return 0;
}

// Terminal Input:
// 10 20
```

## Troubleshooting

### Error: "Piston API is temporarily unavailable"
- **Cause**: Piston server is down or whitelisting is enforced
- **Solution**: Try again in a few moments, or check Piston status

### Error: "Too many requests"
- **Cause**: Rate limiting from Piston
- **Solution**: Wait a moment before executing again

### Error: "Code and language are required"
- **Cause**: Missing `code` or `language` field
- **Solution**: Ensure POST body has both fields

### Code not executing
- **Check**:
  1. Is backend running? (`npm run dev` in backend/)
  2. Is frontend running? (`npm run dev` in frontend/)
  3. Are you logged in?
  4. Is language supported?
  5. Check browser console for errors

### "Invalid language" error
Make sure language is one of:
- `javascript`
- `python`
- `cpp`
- `c`
- `java`
- `csharp`
- `typescript`

## Performance Notes

- **Execution timeout**: 10 seconds max
- **Output limit**: Depends on Piston settings
- **Network latency**: ~500ms-2s per execution
- **Concurrent executions**: Limited by Piston server

## Security

✅ **Safe by default**:
- Code runs on remote Piston servers (not your machine)
- No local file access possible
- Network access restricted based on Piston config
- User data isolated per request
- No persistent state between executions

⚠️ **Limitations**:
- Cannot write to disk
- Cannot access external APIs (usually blocked)
- Cannot fork processes indefinitely
- Cannot make network requests

## Supported Languages Details

| Language | Version | Extensions |
|----------|---------|-----------|
| JavaScript | 18.15.0 | .js |
| TypeScript | 5.0.3 | .ts |
| Python | 3.10.0 | .py |
| C++ | 10.2.0 | .cpp |
| C | 10.2.0 | .c |
| Java | 15.0.2 | .java |
| C# | 6.12.0 | .cs |

## Files Modified

### Backend
- `src/controllers/executeController.js` - Piston API integration
- `src/routes/execute.js` - Execute endpoints

### Frontend
- `src/lib/codeExecute.js` - API client with error handling
- `src/pages/CodeIDE.jsx` - Execution UI integration

## Future Improvements

- [ ] Add syntax highlighting preview before execution
- [ ] Cache recent execution results
- [ ] Add execution history
- [ ] Support more languages
- [ ] Add code snippets/templates
- [ ] Real-time output streaming
- [ ] WebSocket support for long-running code

