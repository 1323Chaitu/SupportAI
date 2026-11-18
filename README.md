# SupportAI – Customer Support & Chatbot Platform

SupportAI is a web-based customer support management platform developed using React. It helps support teams manage customers, track support tickets, maintain knowledge-base articles, monitor conversations, and view support analytics.

The application includes a rule-based chatbot that searches knowledge-base articles and automatically creates a support ticket when it cannot find a relevant answer.

## Features

### 1. Authentication
- Admin login page.
- Protected application routes.
- Logout functionality.
- Session-based demonstration authentication.

### 2. Dashboard
- Overview of customer support activities.
- Total customers and tickets.
- Open and resolved ticket statistics.
- Conversation statistics.

### 3. Ticket Management
- View support tickets.
- Create new tickets.
- Update ticket status.
- Delete tickets.

### 4. Customer Management
- View customer information.
- Check customer conversation history.
- View customer-related ticket and message statistics.

### 5. Live Chat and Chatbot
- Interactive customer chat interface.
- Keyword-based knowledge-base search.
- Automated responses using existing articles.
- Automatic ticket creation when no relevant answer is found.
- Conversation message storage.

### 6. Conversation Monitoring
- View customer conversations.
- Monitor chatbot interactions.
- Review stored chat messages.

### 7. Knowledge Base
- Create knowledge-base articles.
- View existing articles.
- Edit article details.
- Delete articles.

### 8. Analytics
- Dynamic support statistics.
- Ticket status visualization.
- Ticket priority distribution.
- Resolution rate and performance summary.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive design |
| JavaScript | Application logic |
| React.js | Frontend development |
| Vite | Development server and build tool |
| React Router DOM | Page navigation and routing |
| Lucide React | Icons |
| Recharts | Analytics charts |
| JSON Server | Mock REST API |
| JSON | Data storage |

## Project Structure

```text
ai-customer-support/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Tickets.jsx
│   │   ├── Customers.jsx
│   │   ├── LiveChat.jsx
│   │   ├── Conversations.jsx
│   │   ├── KnowledgeBase.jsx
│   │   └── Analytics.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── db.json
├── package.json
├── package-lock.json
├── index.html
└── README.md
```

## Installation and Setup

### Prerequisites

- Node.js
- npm
- Visual Studio Code

### Step 1: Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### Step 2: Navigate to the project directory

```bash
cd ai-customer-support
```

### Step 3: Install dependencies

```bash
npm install
```

### Step 4: Start JSON Server

Open a terminal and execute:

```bash
npx json-server --watch db.json --port 3000
```

JSON Server will run at:

`http://localhost:3000`

### Step 5: Start the React application

Open another terminal and execute:

```bash
npm run dev
```

Open the application in your browser:

`http://localhost:5173`

## Demo Login Credentials

**Email:** admin@supportai.com

**Password:** Admin@123

These are demonstration credentials only. Authentication is implemented on the frontend using sessionStorage. This implementation is not suitable for production use.

## Application Architecture

```text
             User / Admin
                   |
                   v
             React Frontend
                   |
          React Router DOM
                   |
     +-------------+-------------+
     |             |             |
  Dashboard     Customers     Tickets
     |             |             |
     +-------------+-------------+
                   |
              Fetch API
                   |
                   v
             JSON Server
              (REST API)
                   |
                   v
                db.json
                   |
       Customers / Tickets /
       Articles / Conversations
```

## Chatbot Workflow

1. The customer enters a message in the Live Chat interface.
2. The chatbot searches the knowledge-base articles using keyword matching.
3. If a relevant article is found, the chatbot returns its content.
4. If no relevant article is found, the application creates a support ticket.
5. Customer and chatbot messages are stored in the conversations collection.

**Note:** The current chatbot uses rule-based keyword matching. It does not use a generative AI model or an external AI API.

## Learning Outcomes

Through this project, I gained practical experience in:

- Developing reusable React components.
- Managing application state with React hooks.
- Implementing client-side routing.
- Working with REST APIs using Fetch.
- Performing CRUD operations.
- Integrating JSON Server.
- Building interactive chatbot functionality.
- Creating dynamic analytics dashboards.
- Implementing basic authentication and protected routes.
- Developing responsive user interfaces.

## Future Enhancements

- Backend authentication with password hashing.
- Role-based access control.
- Integration with a real AI language model.
- MySQL database integration.
- Real-time chat using WebSockets.
- Customer feedback and satisfaction tracking.

## Author

Developed as a hands-on learning project to strengthen frontend development, API integration, customer support workflows, and chatbot development skills.