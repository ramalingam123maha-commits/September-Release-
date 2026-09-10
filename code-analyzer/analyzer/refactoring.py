"""Refactoring suggestions engine"""

import re
from typing import List
from .models import RefactoringSuggestion, Severity, FileAnalysis


class RefactoringSuggester:
    """Generates refactoring suggestions"""
    
    def generate_suggestions(self, file_analysis: FileAnalysis) -> List[RefactoringSuggestion]:
        """Generate all refactoring suggestions"""
        suggestions = []
        
        suggestions.extend(self._suggest_extract_method(file_analysis))
        suggestions.extend(self._suggest_extract_class(file_analysis))
        suggestions.extend(self._suggest_rename(file_analysis))
        suggestions.extend(self._suggest_simplify_conditionals(file_analysis))
        suggestions.extend(self._suggest_use_constants(file_analysis))
        suggestions.extend(self._suggest_parameter_object(file_analysis))
        suggestions.extend(self._suggest_callback_to_async_await(file_analysis))
        suggestions.extend(self._suggest_remove_duplication(file_analysis))
        
        return suggestions
    
    def _suggest_extract_method(self, file_analysis: FileAnalysis) -> List[RefactoringSuggestion]:
        """Suggest extracting long methods into smaller ones"""
        suggestions = []
        
        for func in file_analysis.functions:
            # Simple heuristic: estimate method size
            if file_analysis.metrics.lines_of_code > 50:
                suggestions.append(RefactoringSuggestion(
                    title="Extract Method",
                    description=f"The function '{func.name}' is doing too much",
                    severity=Severity.MEDIUM,
                    current_code=f"def {func.name}({', '.join(p.name for p in func.parameters)}):\n    # 50+ lines of code",
                    refactored_code=f"""def {func.name}({', '.join(p.name for p in func.parameters)}):\n    result = self._step_one()\n    return self._step_two(result)

def _step_one(self):\n    # First part of logic\n    pass

def _step_two(self, result):\n    # Second part of logic\n    pass""",
                    explanation="Breaking a long method into smaller, focused methods improves readability and testability",
                    benefits=[
                        "Easier to understand and maintain",
                        "Each function has a single responsibility",
                        "Functions become reusable",
                        "Easier to write unit tests",
                    ],
                    location=func.name,
                ))
        
        return suggestions[:1]  # Return at most 1
    
    def _suggest_extract_class(self, file_analysis: FileAnalysis) -> List[RefactoringSuggestion]:
        """Suggest extracting classes from large classes"""
        suggestions = []
        
        for cls in file_analysis.classes:
            if len(cls.methods) > 10:
                suggestions.append(RefactoringSuggestion(
                    title="Extract Class",
                    description=f"Class '{cls.name}' has too many responsibilities",
                    severity=Severity.HIGH,
                    current_code=f"class {cls.name}:\n    def __init__(self): pass\n    # {len(cls.methods)} methods",
                    refactored_code=f"""class {cls.name}:
    def __init__(self):
        self.processor = DataProcessor()
        self.validator = DataValidator()
    
    def process_user_data(self):
        # Delegate to specialized classes
        if self.validator.is_valid():
            return self.processor.transform()

class DataProcessor:
    def transform(self): pass

class DataValidator:
    def is_valid(self): pass""",
                    explanation="Large classes often violate the Single Responsibility Principle",
                    benefits=[
                        "Better separation of concerns",
                        "Classes are easier to test and maintain",
                        "Promotes code reusability",
                        "Improves overall design",
                    ],
                    location=cls.name,
                ))
        
        return suggestions[:1]  # Return at most 1
    
    def _suggest_rename(self, file_analysis: FileAnalysis) -> List[RefactoringSuggestion]:
        """Suggest better naming"""
        suggestions = []
        
        # Look for unclear names
        unclear_names = ['data', 'temp', 'x', 'y', 'obj', 'val', 'tmp', 'result']
        
        for func in file_analysis.functions:
            if func.name in unclear_names:
                suggestions.append(RefactoringSuggestion(
                    title="Rename for Clarity",
                    description=f"Function name '{func.name}' doesn't clearly indicate its purpose",
                    severity=Severity.LOW,
                    current_code=f"def {func.name}(): pass",
                    refactored_code=f"def process_user_data(): pass",
                    explanation="Good naming makes code self-documenting and easier to understand",
                    benefits=[
                        "Improved code readability",
                        "Less need for comments",
                        "Better developer experience for team members",
                    ],
                    location=func.name,
                ))
        
        return suggestions[:1]  # Return at most 1
    
    def _suggest_simplify_conditionals(self, file_analysis: FileAnalysis) -> List[RefactoringSuggestion]:
        """Suggest simplifying complex conditionals"""
        suggestions = []
        
        if file_analysis.metrics.cyclomatic_complexity > 8:
            suggestions.append(RefactoringSuggestion(
                title="Simplify Conditional Logic",
                description="Complex nested conditionals reduce readability",
                severity=Severity.MEDIUM,
                current_code="""if user is not None:
    if user.is_active:
        if user.role == 'admin':
            if user.permissions.has_write:
                perform_action()""",
                refactored_code="""if is_authorized_user(user):
    perform_action()

def is_authorized_user(user):
    return (user and user.is_active and 
            user.role == 'admin' and 
            user.permissions.has_write)""",
                explanation="Extract complex conditionals into guard clauses or boolean methods",
                benefits=[
                    "Improved readability",
                    "Easier to test",
                    "Reusable validation logic",
                    "Reduced cyclomatic complexity",
                ],
                location="conditional logic",
            ))
        
        return suggestions
    
    def _suggest_use_constants(self, file_analysis: FileAnalysis) -> List[RefactoringSuggestion]:
        """Suggest replacing magic numbers with constants"""
        suggestions = []
        
        # Look for magic numbers
        magic_numbers = re.findall(r'\b(?:100|50|25|1000|42|999)\b', file_analysis.content)
        
        if magic_numbers:
            suggestions.append(RefactoringSuggestion(
                title="Replace Magic Numbers with Constants",
                description="Magic numbers make code harder to maintain",
                severity=Severity.LOW,
                current_code="""def calculate_discount(amount):
    if amount > 100:
        return amount * 0.9
    elif amount > 50:
        return amount * 0.95
    return amount""",
                refactored_code="""# At module level
MIN_DISCOUNT_THRESHOLD = 100
DISCOUNT_RATE_HIGH = 0.9
MIN_THRESHOLD = 50
DISCOUNT_RATE_LOW = 0.95

def calculate_discount(amount):
    if amount > MIN_DISCOUNT_THRESHOLD:
        return amount * DISCOUNT_RATE_HIGH
    elif amount > MIN_THRESHOLD:
        return amount * DISCOUNT_RATE_LOW
    return amount""",
                explanation="Named constants make the meaning of values explicit",
                benefits=[
                    "Code is self-documenting",
                    "Easier to change values later",
                    "Reduces cognitive load",
                    "Prevents inconsistencies",
                ],
                location="various",
            ))
        
        return suggestions
    
    def _suggest_parameter_object(self, file_analysis: FileAnalysis) -> List[RefactoringSuggestion]:
        """Suggest using parameter objects"""
        suggestions = []
        
        for func in file_analysis.functions:
            if len(func.parameters) > 4:
                suggestions.append(RefactoringSuggestion(
                    title="Introduce Parameter Object",
                    description=f"Function '{func.name}' has too many parameters",
                    severity=Severity.MEDIUM,
                    current_code=f"def {func.name}(first_name, last_name, email, phone, address): pass",
                    refactored_code=f"""class UserInfo:
    def __init__(self, first_name, last_name, email, phone, address):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.phone = phone
        self.address = address

def {func.name}(user_info: UserInfo): pass""",
                    explanation="Grouping related parameters improves function signature clarity",
                    benefits=[
                        "Cleaner function signatures",
                        "Easier to add new parameters",
                        "Type hints become clearer",
                        "Better data encapsulation",
                    ],
                    location=func.name,
                ))
        
        return suggestions[:1]  # Return at most 1
    
    def _suggest_callback_to_async_await(self, file_analysis: FileAnalysis) -> List[RefactoringSuggestion]:
        """Suggest converting callbacks to async/await"""
        suggestions = []
        
        content = file_analysis.content
        
        if re.search(r'\.then\s*\(|\.catch\s*\(', content) or 'callback' in content.lower():
            suggestions.append(RefactoringSuggestion(
                title="Convert to Async/Await",
                description="Callback-based code is harder to read and maintain",
                severity=Severity.MEDIUM,
                current_code="""function loadUserData(userId, callback) {
    fetchUser(userId, (err, user) => {
        if (err) callback(err);
        else {
            fetchPermissions(user.id, (err, perms) => {
                callback(err, { user, perms });
            });
        }
    });
}""",
                refactored_code="""async function loadUserData(userId) {
    try {
        const user = await fetchUser(userId);
        const perms = await fetchPermissions(user.id);
        return { user, perms };
    } catch (err) {
        throw err;
    }
}""",
                explanation="Async/await is cleaner and more readable than nested callbacks",
                benefits=[
                    "Linear code flow that's easier to follow",
                    "Better error handling with try/catch",
                    "Reduced callback nesting (pyramid of doom)",
                    "Improved code maintainability",
                ],
                location="async operations",
            ))
        
        return suggestions
    
    def _suggest_remove_duplication(self, file_analysis: FileAnalysis) -> List[RefactoringSuggestion]:
        """Suggest removing code duplication"""
        suggestions = []
        
        lines = file_analysis.content.split('\n')
        
        # Look for similar patterns
        for i, line in enumerate(lines):
            stripped = line.strip()
            if not stripped or len(stripped) < 20:
                continue
            
            count = sum(1 for l in lines if l.strip() == stripped)
            if count >= 3:
                suggestions.append(RefactoringSuggestion(
                    title="Extract Duplicate Code",
                    description="Similar code pattern appears multiple times",
                    severity=Severity.MEDIUM,
                    current_code=f"""# Line {i+1}
{stripped}
# ... (repeated 2+ times)
{stripped}""",
                    refactored_code="""def common_operation():
    # Extracted common logic
    pass

# Use in multiple places
result1 = common_operation()
result2 = common_operation()""",
                    explanation="DRY principle: Don't Repeat Yourself",
                    benefits=[
                        "Single source of truth",
                        "Easier maintenance",
                        "Reduced code size",
                        "Fewer bugs from inconsistent changes",
                    ],
                    location=f"line {i+1}",
                ))
                break
        
        return suggestions[:1]  # Return at most 1
