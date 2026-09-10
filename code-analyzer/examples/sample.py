"""Sample Python module for analysis"""

import sys
import os
from typing import List, Dict, Optional
from dataclasses import dataclass


@dataclass
class User:
    """User information"""
    name: str
    email: str
    age: int
    active: bool = True


class UserManager:
    """Manages user operations - does too much!"""
    
    def __init__(self):
        self.users = []
        self.db_connection = None
    
    def load_users_from_file(self, file_path: str):
        """Load users from file"""
        with open(file_path, 'r') as f:
            data = f.read()
        return data
    
    def save_users_to_database(self, user_data: List[User]):
        """Save users to database"""
        for user in user_data:
            if user.active:
                self.db_connection.insert(user)
    
    def validate_user_email(self, email: str) -> bool:
        """Validate email format"""
        return '@' in email and '.' in email
    
    def process_and_store_users(self, file_path: str, users: List[User]):
        """Process users - way too long!"""
        # Load from file
        raw_data = self.load_users_from_file(file_path)
        
        # Process each user
        for user in users:
            # Validate
            if not self.validate_user_email(user.email):
                print(f"Invalid email: {user.email}")
                continue
            
            # Transform
            user.name = user.name.upper()
            
            # Store
            self.save_users_to_database([user])
    
    def handle_user_request(self, request_type: str, user_id: str, user_name: str, 
                           user_email: str, user_age: int, is_active: bool, 
                           department: str, role: str, permissions: List[str]) -> str:
        """Handle user request - too many parameters!"""
        if request_type == "create":
            user = User(name=user_name, email=user_email, age=user_age, active=is_active)
            self.users.append(user)
            return f"Created user: {user_name}"
        elif request_type == "delete":
            self.users = [u for u in self.users if u.name != user_name]
            return f"Deleted user: {user_name}"
        return "Unknown request"


def duplicate_validation(data):
    """Validation function with duplicate code"""
    if data is None:
        return False
    if len(data) == 0:
        return False
    if not isinstance(data, list):
        return False
    return True


def another_validation(items):
    """Another validation - repeated pattern"""
    if items is None:
        return False
    if len(items) == 0:
        return False
    if not isinstance(items, list):
        return False
    return True


# Magic numbers everywhere!
def calculate_discount(price: float) -> float:
    """Calculate discount - magic numbers!"""
    if price > 100:
        return price * 0.9
    elif price > 50:
        return price * 0.95
    elif price > 25:
        return price * 0.98
    return price


def deeply_nested_function(a, b, c, d):
    """Deeply nested conditional logic"""
    if a:
        if b:
            if c:
                if d:
                    if a and b and c:
                        return "deeply nested"
    return None


# Bad exception handling
def risky_operation():
    """Silent exception handling"""
    try:
        result = 10 / 0
    except:
        pass
    return result
