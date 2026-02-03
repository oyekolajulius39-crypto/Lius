# Lius Finance Dashboard

A modern, professional finance dashboard web application built with HTML, CSS, JavaScript, and Firebase.

## Features

✨ **Complete Authentication System**
- User signup with email and password
- User login with validation
- Protected dashboard routes
- Secure logout functionality

💰 **Real-time Finance Management**
- Live balance updates using Firestore
- Track income and expenses
- Monthly summary statistics
- Transaction categorization

📊 **Transaction Management**
- Add new transactions (income/expense)
- View transaction history
- Filter by type and category
- Delete transactions
- Real-time synchronization

🎨 **Modern UI/UX**
- Clean blue and white theme inspired by fintech leaders
- Responsive mobile-first design
- Smooth animations and transitions
- Toast notifications
- Modal dialogs
- Professional sidebar navigation

## Project Structure

```
lius-finance/
├── signup.html              # User registration page
├── login.html               # User login page
├── dashboard.html           # Main dashboard with summary cards
├── transactions.html        # Transaction history page
├── css/
│   └── style.css           # All styles with animations
└── js/
    ├── firebase.js         # Firebase configuration
    ├── auth.js             # Authentication logic
    ├── dashboard.js        # Dashboard functionality
    └── transactions.js     # Transaction management
```

## Setup Instructions

### 1. Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Enter project name: "Lius Finance" (or your choice)
   - Follow the setup wizard

2. **Enable Authentication**
   - In Firebase Console, go to "Authentication"
   - Click "Get Started"
   - Enable "Email/Password" sign-in method

3. **Create Firestore Database**
   - In Firebase Console, go to "Firestore Database"
   - Click "Create Database"
   - Start in **Production mode** (we'll set rules next)
   - Choose a location closest to your users

4. **Set Firestore Security Rules**
   - In Firestore Database, go to "Rules"
   - Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Transactions collection
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
    }
  }
}
```

5. **Get Firebase Configuration**
   - In Firebase Console, go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click the Web icon (</>)
   - Register your app
   - Copy the Firebase configuration object

### 2. Configure the App

1. **Update Firebase Config**
   - Open `js/firebase.js`
   - Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Deploy the App

#### Option A: Local Development

1. **Use a Local Server**
   - Install [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code
   - Or use Python: `python -m http.server 8000`
   - Or use Node.js: `npx http-server`

2. **Open in Browser**
   - Navigate to `http://localhost:8000/signup.html`

#### Option B: Firebase Hosting

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Hosting**
```bash
firebase init hosting
```
   - Select your project
   - Set public directory to current directory (`.`)
   - Configure as single-page app: No
   - Don't overwrite existing files

4. **Deploy**
```bash
firebase deploy --only hosting
```

#### Option C: Netlify/Vercel

1. **Connect Git Repository**
   - Push code to GitHub
   - Connect repo to Netlify or Vercel

2. **Deploy**
   - Build command: (none needed)
   - Publish directory: `.`

## Usage Guide

### Creating an Account
1. Go to `signup.html`
2. Enter your full name, email, and password (min 6 characters)
3. Click "Create Account"
4. You'll be redirected to the dashboard

### Logging In
1. Go to `login.html`
2. Enter your email and password
3. Click "Sign In"

### Adding Transactions
1. Click "Add Transaction" button
2. Select type (Income or Expense)
3. Enter amount, description, and category
4. Click "Add Transaction"
5. Transaction appears immediately with real-time updates

### Viewing Transactions
1. Navigate to "Transactions" in the sidebar
2. Use filters to view specific types or categories
3. Delete transactions by clicking the delete icon

### Dashboard Overview
- **Total Balance**: Sum of all income minus expenses
- **Income**: Total income for current month
- **Expenses**: Total expenses for current month
- **Recent Transactions**: Last 5 transactions

## Firestore Data Structure

### Transactions Collection
```javascript
{
  userId: "user-uid",
  type: "income" | "expense",
  amount: 100.00,
  description: "Salary payment",
  category: "salary",
  createdAt: Timestamp
}
```

## Design System

### Colors
- Primary: `#1E40AF` (Deep Blue)
- Accent: `#3B82F6` (Sky Blue)
- Background: `#FFFFFF` (White)
- Cards: `#F9FAFB` (Light Gray)
- Success: `#10B981` (Green)
- Error: `#EF4444` (Red)

### Typography
- Font Family: Lexend
- Headings: 700 weight
- Body: 400 weight
- Labels: 500-600 weight

### Components
- Rounded corners: 10-16px
- Box shadows: Subtle elevation
- Animations: Smooth transitions
- Responsive breakpoints: 768px, 1024px

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security Notes
- All routes are protected by Firebase Authentication
- Firestore rules ensure users can only access their own data
- Passwords are hashed by Firebase Authentication
- HTTPS is enforced in production

## Troubleshooting

### "Firebase config not found"
- Ensure you've updated `js/firebase.js` with your actual config

### "Permission denied" errors
- Check Firestore security rules are correctly set
- Ensure user is authenticated

### Transactions not appearing
- Check browser console for errors
- Verify Firestore rules allow read/write
- Ensure you're logged in

### Mobile menu not working
- Clear browser cache
- Check JavaScript is enabled

## Future Enhancements
- Budget tracking and alerts
- Data visualization charts
- Export to CSV/PDF
- Recurring transactions
- Multi-currency support
- Receipt upload
- Bank account integration

## License
MIT License - Feel free to use this project for personal or commercial purposes.

## Support
For issues or questions, check the browser console for error messages and verify your Firebase configuration is correct.

---

Built with ❤️ using Firebase and modern web technologies
