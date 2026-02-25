# OTP Email Verification Setup Guide

This document explains how to set up email verification with OTP for your IDE authentication system.

## Features

- **Gmail Validation**: Only Gmail accounts are supported for registration
- **OTP Generation**: Automatically generates a 6-digit OTP on signup
- **Email Sending**: Sends OTP via email using nodemailer (Gmail SMTP)
- **OTP Verification**: Users must enter the OTP to complete registration
- **OTP Expiry**: OTP expires after 10 minutes
- **Resend OTP**: Users can request a new OTP if the previous one expires

## Backend Setup

### 1. Install Dependencies

```bash
npm install nodemailer
```

### 2. Environment Configuration

Add the following variables to your `.env` file in the backend directory:

```
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Gmail App Password Setup

To use Gmail with nodemailer, you need to:

1. **Enable 2-Step Verification** on your Google Account:
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password**:
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your device)
   - Generate a 16-character password
   - Copy this password and use it as `EMAIL_PASSWORD` in your `.env` file

### 4. Database Updates

The User model has been updated with the following new fields:

```javascript
{
  isEmailVerified: Boolean (default: false),
  otp: String (NOT selected by default),
  otpExpiry: Date (NOT selected by default)
}
```

## API Endpoints

### 1. Signup - `/api/auth/signup`

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@gmail.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully. OTP sent to your email.",
  "data": {
    "userId": "user_id",
    "email": "john@gmail.com",
    "username": "john_doe",
    "message": "Please verify your email with the 6-digit OTP sent to your Gmail"
  }
}
```

### 2. Verify OTP - `/api/auth/verify-otp`

**Request:**
```json
{
  "email": "john@gmail.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@gmail.com",
      "isEmailVerified": true
    },
    "token": "jwt_token"
  }
}
```

### 3. Resend OTP - `/api/auth/resend-otp`

**Request:**
```json
{
  "email": "john@gmail.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent successfully"
}
```

### 4. Signin - `/api/auth/signin`

**Note**: Users can only sign in after email verification. The signin endpoint now checks the `isEmailVerified` flag.

**Error Response (Email Not Verified):**
```json
{
  "success": false,
  "message": "Please verify your email first. OTP was sent to your registered Gmail."
}
```

## Frontend Components

### New Components Created

1. **OTPVerificationCard** (`/src/components/pagesCard/OTPVerificationCard.jsx`)
   - Displays 6 input fields for OTP entry
   - Auto-focus on next field when digit is entered
   - Paste functionality to paste full OTP
   - Resend OTP button with 60-second cooldown
   - Countdown timer for resend button

2. **OTPVerification Page** (`/src/pages/OTPVerification.jsx`)
   - Full page component with animated background
   - Uses OTPVerificationCard

### Updated Components

1. **SignupCard** (`/src/components/pagesCard/SignupCard.jsx`)
   - Now redirects to `/verify-otp` after successful signup
   - Stores email in localStorage for OTP verification flow

2. **App.jsx**
   - Added `/verify-otp` route pointing to OTPVerification page

## User Flow

### Registration Flow

1. User enters username, email, and password on `/signup`
2. Click "Sign Up"
3. Backend validates Gmail address
4. OTP is generated and sent to user's email
5. User is redirected to `/verify-otp`
6. User enters 6-digit OTP
7. OTP is verified on backend
8. Email is marked as verified
9. User receives JWT token and is redirected to home page (`/e/{roomId}`)

### Login Flow

1. User enters email and password on `/signin`
2. Backend checks if email is verified
3. If email is not verified, user sees error message to verify email first
4. If email is verified, normal login process continues

## Validation Rules

### Signup Validation

- **Email**: Must be a Gmail address (ends with @gmail.com)
- **Username**: 3-30 characters, alphanumeric and underscores only
- **Password**: Minimum 6 characters

### OTP Validation

- **OTP**: Must be exactly 6 digits
- **Expiry**: Valid for 10 minutes from generation
- **Rate Limiting**: Users can resend OTP every 60 seconds

## Error Handling

### Common Errors

1. **"Only Gmail accounts are supported for registration"**
   - User tried to sign up with non-Gmail email

2. **"Email already registered"**
   - Email is already associated with an account

3. **"OTP has expired. Please sign up again."**
   - User took longer than 10 minutes to verify OTP

4. **"Invalid OTP. Please try again."**
   - Entered OTP doesn't match the sent OTP

5. **"Failed to send OTP. Please check your email address and try again."**
   - Email sending failed (check Gmail credentials in .env)

## Testing the Setup

### 1. Test with Gmail Account

Create a test Gmail account and test the full flow:

```bash
# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@gmail.com",
    "password": "password123"
  }'
```

### 2. Check Email

Check the test Gmail account for the OTP email

### 3. Test OTP Verification

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "otp": "123456"
  }'
```

## Security Considerations

1. **OTP Storage**: OTPs are stored in database (not selected by default via Mongoose)
2. **OTP Expiry**: 10-minute expiration prevents replay attacks
3. **Email Validation**: Only Gmail addresses are accepted
4. **Rate Limiting**: Consider adding rate limiting to OTP endpoints in production
5. **Email Password**: Use Gmail App Password, NOT your actual Gmail password

## Future Enhancements

1. Add rate limiting to OTP endpoints
2. Support multiple email providers (not just Gmail)
3. Add SMS OTP as alternative
4. Add email templates for better customization
5. Add OTP attempt limiting (max 3 attempts before resend)
6. Add email address confirmation/change flow
7. Add two-factor authentication (2FA)

## Troubleshooting

### Issue: "Failed to send OTP" Error

**Solution:**
1. Check that EMAIL_USER and EMAIL_PASSWORD are set in .env
2. Verify that you're using Gmail App Password, not your actual password
3. Enable "Less secure app access" if using regular Gmail password
4. Check Gmail security settings and allow nodemailer

### Issue: OTP Not Received

**Solution:**
1. Check spam/junk folder
2. Verify EMAIL_USER is a real Gmail account
3. Check server logs for email sending errors
4. Verify internet connection on server

### Issue: "Please verify your email first" on Login

**Solution:**
1. User hasn't completed OTP verification flow
2. Direct user to `/verify-otp` to complete verification
3. Check database to see if `isEmailVerified` is false for the user

