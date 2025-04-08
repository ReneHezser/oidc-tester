# 🧪 OIDC Auth Tester (Authorization Code Flow)

This is a simple web application built with Node.js and Express to help you test OIDC authentication using the Authorization Code Flow.

## 🔧 Features

- Test OIDC Authorization Code Flow by providing configuration via form.
- View decoded `access_token` and `id_token` with their claims.
- Copy tokens to clipboard.
- Logout from the Identity Provider (IDP).
- Support for multiple saved configurations using localStorage.
- SSL verification is disabled for testing against self-signed certificates.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm

---

### 🛠 Installation

```bash
git clone https://github.com/your-username/oidc-auth-tester.git
cd oidc-auth-tester
npm install
```

---

### ▶️ Running the App

```bash
node start
```

Open your browser and go to:  
👉 `http://localhost:5000`

---

## ✍️ Usage

1. Enter the following details on the main page:
   - Discovery URL
   - Client ID
   - Client Secret (if applicable)
   - Redirect URI (e.g., `http://localhost:5000/callback`)
   - Scope (e.g., `openid profile email`)
  
   ![image](https://github.com/user-attachments/assets/0250ccfd-6413-4652-a679-e64c7abfda17)

2. Click **Start Authorization** to begin the flow.

3. After authentication, you’ll see:
   - Decoded `access_token` and `id_token`
   - Claims from each token
   - Expiration time in a readable format
   - Buttons to copy tokens to clipboard
  
   ![image](https://github.com/user-attachments/assets/800d9da2-b71c-462a-92f2-a7f52e239edc)

4. Click **Logout** to trigger the end session endpoint of the IDP.

---

## 🧠 Notes

- SSL certificate verification is disabled (for development use only).
- Tokens and configuration data are stored in memory and localStorage.
- This tool is meant for **development and debugging** only.
