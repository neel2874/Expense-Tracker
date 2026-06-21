# 💰 Expense Tracker

A modern, responsive, and feature-rich Expense Tracker web application. Built with a Flask backend, MongoDB database, and a beautiful Vanilla HTML/CSS/JS frontend featuring glassmorphism design and interactive elements.

## ✨ Features

- **User Authentication**: Secure sign up and login functionality with password hashing.
- **Dashboard Overview**: A sleek dashboard to view total balance, income, and expenses at a glance.
- **Transaction Management**: Easily add, view, and categorize your transactions (Food, Transport, Bills, etc.).
- **Budget Tracking**: Set budget limits and visually track your category-wise spending with progress bars.
- **Responsive Design**: Fully responsive UI that works seamlessly across desktop, tablet, and mobile devices.
- **Modern UI/UX**: Premium dark-themed landing page and a frosted-glass (glassmorphism) dashboard design.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript
- **Backend**: Python, Flask
- **Database**: MongoDB (Atlas)
- **Deployment**: Configured for Render (Gunicorn, WSGI)

## 🚀 Local Setup Instructions

Follow these steps to run the application on your local machine.

### Prerequisites
- Python 3.x installed
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Expense-Tracker.git
   cd Expense-Tracker
   ```

2. **Set up a virtual environment (Optional but recommended)**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. **Install the dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python Backend/app.py
   ```
   The app will start a development server. Open your browser and navigate to `http://localhost:5000`.

## ☁️ Deployment

This project is configured to be easily deployed on [Render](https://render.com).

1. Push your code to a GitHub repository.
2. Create a **New Web Service** on Render and connect your repository.
3. Configure the service:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app`

## 📁 Project Structure

```
Expense-Tracker/
│
├── Backend/                 # Flask server and Database logic
│   ├── app.py               # Main application and API routes
│   └── database.py          # MongoDB connection and queries
│
├── Frontend/                # UI Files (HTML, CSS, JS)
│   ├── Auth/                # Login and Register pages
│   ├── landing page/        # Showcase landing page
│   ├── index.html           # Main Dashboard HTML
│   ├── style.css            # Dashboard styles
│   └── script.js            # Dashboard logic
│
├── requirements.txt         # Python dependencies
├── wsgi.py                  # Production entry point for Gunicorn
└── .gitignore               # Ignored files for git
```