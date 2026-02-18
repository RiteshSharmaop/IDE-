``` mermaid
    graph TD
    Start([User Visits /signup]) --> InputForm["Enter: Username, Gmail, Password"]
    InputForm --> ClickSignup["Click 'Sign Up' Button"]
    ClickSignup --> API1["POST /api/auth/signup"]
    API1 --> Validate1{"Gmail Address<br/>Valid?"}
    Validate1 -->|No| Error1["❌ Only Gmail<br/>Accounts Allowed"]
    Error1 --> InputForm
    Validate1 -->|Yes| CheckEmail{"Email Already<br/>Registered?"}
    CheckEmail -->|Yes| Error2["❌ Email<br/>Already Exists"]
    Error2 --> InputForm
    CheckEmail -->|No| GenOTP["🔄 Generate<br/>6-Digit OTP"]
    GenOTP --> SaveDB["💾 Save OTP +<br/>10min Expiry"]
    SaveDB --> SendEmail["📧 Send OTP<br/>via Email"]
    SendEmail --> CheckEmail2{"Email Sent<br/>Success?"}
    CheckEmail2 -->|No| Error3["❌ Failed to<br/>Send OTP"]
    Error3 --> InputForm
    CheckEmail2 -->|Yes| Redirect1["↗️ Redirect to<br/>/verify-otp"]
    
    Redirect1 --> OTPPage["User Sees<br/>6-Digit Input"]
    OTPPage --> EnterOTP["Enter 6 Digits<br/>in Boxes"]
    EnterOTP --> ClickVerify["Click 'Verify OTP'"]
    ClickVerify --> API2["POST /api/auth/verify-otp"]
    API2 --> Validate2{"OTP<br/>Valid?"}
    Validate2 -->|No Format| Error4["❌ Enter 6 Digits"]
    Error4 --> EnterOTP
    Validate2 -->|Invalid| Error5["❌ Invalid OTP"]
    Error5 --> EnterOTP
    Validate2 -->|Expired| Error6["❌ OTP Expired<br/>10 Minutes"]
    Error6 --> ShowResend["Show Resend<br/>Button"]
    ShowResend --> EnterOTP
    Validate2 -->|Valid| MarkVerified["✅ Mark Email<br/>as Verified"]
    MarkVerified --> ClearOTP["🗑️ Clear OTP<br/>from Database"]
    ClearOTP --> GenToken["🔑 Generate<br/>JWT Token"]
    GenToken --> SaveToken["💾 Save Token<br/>in LocalStorage"]
    SaveToken --> CreateRoom["🏠 Create Room ID"]
    CreateRoom --> Redirect2["↗️ Redirect to<br/>/e/roomId"]
    Redirect2 --> HomePage["✨ User at<br/>Home Page"]
    
    Login1([User Visits /signin]) --> LoginForm["Enter: Email,<br/>Password"]
    LoginForm --> ClickLogin["Click 'Login'"]
    ClickLogin --> API3["POST /api/auth/signin"]
    API3 --> CheckCreds{"Credentials<br/>Valid?"}
    CheckCreds -->|No| LoginError["❌ Invalid<br/>Credentials"]
    LoginError --> LoginForm
    CheckCreds -->|Yes| CheckVerified{"Email<br/>Verified?"}
    CheckVerified -->|No| LoginError2["❌ Verify Email<br/>First"]
    LoginError2 --> LoginForm
    CheckVerified -->|Yes| CheckActive{"Account<br/>Active?"}
    CheckActive -->|No| LoginError3["❌ Account<br/>Deactivated"]
    LoginError3 --> LoginForm
    CheckActive -->|Yes| LoginToken["🔑 Generate<br/>JWT Token"]
    LoginToken --> LoginSave["💾 Save Token<br/>in LocalStorage"]
    LoginSave --> LoginRedirect["↗️ Redirect to<br/>Home"]
    LoginRedirect --> HomePage
    
    style Start fill:#2c3e50,stroke:#3498db,color:#fff
    style HomePage fill:#27ae60,stroke:#2ecc71,color:#fff
    style Error1 fill:#e74c3c,stroke:#c0392b,color:#fff
    style Error2 fill:#e74c3c,stroke:#c0392b,color:#fff
    style Error3 fill:#e74c3c,stroke:#c0392b,color:#fff
    style Error4 fill:#e74c3c,stroke:#c0392b,color:#fff
    style Error5 fill:#e74c3c,stroke:#c0392b,color:#fff
    style Error6 fill:#e74c3c,stroke:#c0392b,color:#fff
    style GenOTP fill:#f39c12,stroke:#e67e22,color:#fff
    style SendEmail fill:#3498db,stroke:#2980b9,color:#fff
    style MarkVerified fill:#27ae60,stroke:#229954,color:#fff
    style GenToken fill:#9b59b6,stroke:#8e44ad,color:#fff
    style API1 fill:#34495e,stroke:#2c3e50,color:#fff
    style API2 fill:#34495e,stroke:#2c3e50,color:#fff
    style API3 fill:#34495e,stroke:#2c3e50,color:#fff
```