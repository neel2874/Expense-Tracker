from flask import Flask, jsonify, request, render_template, session, redirect, url_for
from database import ExpenseTrackerDB
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, template_folder='../Frontend', static_folder='../Frontend', static_url_path='')
app.secret_key = 'super-secret-key-for-expense-tracker-app-session-key'
db = ExpenseTrackerDB()

# Route to serve the landing page for unauthenticated users, or dashboard for logged-in users
@app.route('/')
def home():
    if 'user_id' not in session:
        return render_template('landing page/landing.html')
    return render_template('index.html')

# Explicit landing page route
@app.route('/landing')
def landing():
    return render_template('landing page/landing.html')

# Dashboard route for logged-in users
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('index.html')

# Route to serve the login page
@app.route('/login')
def login():
    if 'user_id' in session:
        return redirect(url_for('home'))
    return render_template('Auth/login.html')

# Route to serve the register page
@app.route('/register')
def register():
    if 'user_id' in session:
        return redirect(url_for('home'))
    return render_template('Auth/register.html')

# API Route: Register a new user
@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    name = data.get('name', '')
    
    if not username or not password:
        return jsonify({"status": "error", "message": "Email and password are required"}), 400
        
    existing_user = db.get_user_by_username(username)
    if existing_user:
        return jsonify({"status": "error", "message": "User with this email already exists"}), 400
        
    password_hash = generate_password_hash(password)
    user_id = db.create_user(username, password_hash, name)
    
    session['user_id'] = user_id
    session['username'] = username
    session['name'] = name
    
    return jsonify({"status": "success", "message": "User registered successfully"}), 201

# API Route: Login user
@app.route('/api/login', methods=['POST'])
def login_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"status": "error", "message": "Email and password are required"}), 400
        
    user = db.get_user_by_username(username)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({"status": "error", "message": "Invalid email or password"}), 401
        
    session['user_id'] = user['_id']
    session['username'] = user['username']
    session['name'] = user.get('name', '')
    
    return jsonify({"status": "success", "message": "Logged in successfully"}), 200

# API Route: Logout user
@app.route('/api/logout', methods=['GET', 'POST'])
def logout_user():
    session.clear()
    return redirect(url_for('login'))

# API Route: Get all transactions and budget status for the logged-in user
@app.route('/api/data', methods=['GET'])
def get_data():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
        
    transactions = db.get_all_transactions(user_id)
    budget_limit = db.get_budget_limit(user_id)
    
    # Calculate totals
    total_income = sum(t['amount'] for t in transactions if t['type'] == 'income')
    total_expense = sum(t['amount'] for t in transactions if t['type'] == 'expense')
    balance = total_income - total_expense
    
    # Check if budget is breached
    budget_alert = total_expense > budget_limit
    
    # Sort transactions by date descending (optional, let's keep recent ones first)
    transactions.sort(key=lambda x: x.get('date', ''), reverse=True)

    return jsonify({
        "transactions": transactions,
        "summary": {
            "income": total_income,
            "expense": total_expense,
            "balance": balance,
            "budget_limit": budget_limit,
            "budget_alert": budget_alert
        }
    })

# API Route: Add a new transaction
@app.route('/api/transaction', methods=['POST'])
def add_transaction():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
        
    data = request.json
    db.add_transaction(
        user_id=user_id,
        title=data['title'],
        amount=data['amount'],
        type_=data['type'],
        category=data['category'],
        date=data.get('date', '')
    )
    return jsonify({"status": "success", "message": "Transaction added successfully"}), 201

if __name__ == '__main__':
    # Run the development server
    app.run(debug=True, port=5000)