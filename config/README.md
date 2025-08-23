# Firebase Configuration

## Important: Service Account Credentials

The Firebase service account JSON file (`iot-gateway-8ec36-firebase-adminsdk-fbsvc-613f092efd.json`) contains sensitive credentials and should NEVER be committed to version control.

### Setup Instructions:

1. Keep the Firebase service account JSON file in this `config/` directory
2. The file is already listed in `.gitignore` to prevent accidental commits
3. For production deployment, use environment variables or secure secret management

### Security Note:
- This file provides admin access to your Firebase project
- Keep it secure and never share it publicly
- For team collaboration, each developer should use their own service account