from pymongo import MongoClient
from bson import ObjectId

class ExpenseTrackerDB:
    def __init__(self):
        # Connect to MongoDB Atlas instance
        self.client = MongoClient("mongodb+srv://neel6528_db_user:neel0110@cluster0.jjgpoby.mongodb.net/?appName=Cluster0")
        # Create or use a database named 'expense_tracker'
        self.db = self.client["expense_tracker"]
        # Create collections for users, transactions, and budget settings
        self.users = self.db["users"]
        self.transactions = self.db["transactions"]
        self.budget = self.db["budget"]

    def create_user(self, username, password_hash, name):
        """Inserts a new user document."""
        user = {
            "username": username.lower().strip(),
            "password_hash": password_hash,
            "name": name
        }
        res = self.users.insert_one(user)
        return str(res.inserted_id)

    def get_user_by_username(self, username):
        """Retrieves a user document by username/email."""
        user = self.users.find_one({"username": username.lower().strip()})
        if user:
            user["_id"] = str(user["_id"])
        return user

    def add_transaction(self, user_id, title, amount, type_, category, date):
        """Inserts a new income or expense document scoped to a user."""
        transaction = {
            "user_id": user_id,
            "title": title,
            "amount": float(amount),
            "type": type_, # 'income' or 'expense'
            "category": category,
            "date": date
        }
        return self.transactions.insert_one(transaction)

    def get_all_transactions(self, user_id):
        """Retrieves all transactions scoped to a specific user."""
        transactions = list(self.transactions.find({"user_id": user_id}))
        # Convert ObjectId to string for JSON serialization compatibility
        for t in transactions:
            t["_id"] = str(t["_id"])
        return transactions

    def get_budget_limit(self, user_id):
        """Retrieves the current budget limit for a specific user, default to 1000.0 if not set."""
        doc = self.budget.find_one({"user_id": user_id})
        if not doc:
            self.budget.insert_one({"user_id": user_id, "limit": 1000.0})
            return 1000.0
        return doc["limit"]

    def update_budget_limit(self, user_id, limit):
        """Updates or inserts the budget limit for a specific user."""
        self.budget.update_one(
            {"user_id": user_id},
            {"$set": {"limit": float(limit)}},
            upsert=True
        )