"""Code smell and anti-pattern detection"""

import re
from typing import List
from .models import CodeSmell, Severity, FileAnalysis


class SmellDetector:
    """Detects code smells and anti-patterns"""
    
    def detect_smells(self, file_analysis: FileAnalysis) -> List[CodeSmell]:
        """Detect all types of code smells"""
        smells = []
        
        # Run all detectors
        smells.extend(self._detect_long_methods(file_analysis))
        smells.extend(self._detect_large_classes(file_analysis))
        smells.extend(self._detect_many_parameters(file_analysis))
        smells.extend(self._detect_duplicate_code(file_analysis))
        smells.extend(self._detect_magic_numbers(file_analysis))
        smells.extend(self._detect_deep_nesting(file_analysis))
        smells.extend(self._detect_catch_all_exceptions(file_analysis))
        smells.extend(self._detect_unused_imports(file_analysis))
        smells.extend(self._detect_callback_hell(file_analysis))
        smells.extend(self._detect_multiple_responsibilities(file_analysis))
        
        return smells
    
    def _detect_long_methods(self, file_analysis: FileAnalysis) -> List[CodeSmell]:
        """Detect methods/functions with too many lines"""
        smells = []
        
        for func in file_analysis.functions:
            # Estimate function size (simplified)
            if file_analysis.metrics.lines_of_code > 100 and len(file_analysis.functions) < 5:
                smells.append(CodeSmell(
                    name="Long Method",
                    severity=Severity.HIGH,
                    line_number=1,
                    column=0,
                    description=f"Function '{func.name}' is likely too long and hard to understand",
                    suggestion="Break down the function into smaller, single-purpose functions",
                    code_snippet=func.name,
                ))
        
        return smells
    
    def _detect_large_classes(self, file_analysis: FileAnalysis) -> List[CodeSmell]:
        """Detect classes with too many responsibilities"""
        smells = []
        
        for cls in file_analysis.classes:
            if len(cls.methods) > 15:
                smells.append(CodeSmell(
                    name="Large Class",
                    severity=Severity.HIGH,
                    line_number=1,
                    column=0,
                    description=f"Class '{cls.name}' has too many methods ({len(cls.methods)})",
                    suggestion="Consider splitting the class into smaller, focused classes using the Single Responsibility Principle",
                    code_snippet=cls.name,
                ))
        
        return smells
    
    def _detect_many_parameters(self, file_analysis: FileAnalysis) -> List[CodeSmell]:
        """Detect functions with too many parameters"""
        smells = []
        
        for func in file_analysis.functions:
            if len(func.parameters) > 6:
                smells.append(CodeSmell(
                    name="Too Many Parameters",
                    severity=Severity.MEDIUM,
                    line_number=1,
                    column=0,
                    description=f"Function '{func.name}' has {len(func.parameters)} parameters",
                    suggestion="Group related parameters into a configuration object or use the Builder pattern",
                    code_snippet=f"def {func.name}({', '.join(p.name for p in func.parameters)})",
                ))
        
        return smells
    
    def _detect_duplicate_code(self, file_analysis: FileAnalysis) -> List[CodeSmell]:
        """Detect duplicate code patterns"""
        smells = []
        
        lines = file_analysis.content.split('\n')
        
        # Simple duplicate detection: look for repeated blocks
        for i, line in enumerate(lines):
            stripped = line.strip()
            if not stripped or len(stripped) < 20:
                continue
            
            # Count how many times this pattern appears
            count = sum(1 for l in lines if l.strip() == stripped)
            if count >= 3:
                smells.append(CodeSmell(
                    name="Duplicate Code",
                    severity=Severity.MEDIUM,
                    line_number=i + 1,
                    column=0,
                    description="This code pattern appears multiple times in the file",
                    suggestion="Extract the repeated code into a shared function or utility",
                    code_snippet=stripped[:50],
                ))
                break  # Only report once per file
        
        return smells
    
    def _detect_magic_numbers(self, file_analysis: FileAnalysis) -> List[CodeSmell]:
        """Detect magic numbers in code"""
        smells = []
        
        content = file_analysis.content
        
        # Find magic numbers (numbers not in variable assignments)
        magic_pattern = r'(?<![="\'])(\b(?:0|[1-9]\d*)\b|0x[0-9a-fA-F]+)(?!["\'])'
        matches = re.findall(magic_pattern, content)
        
        # Count occurrences of specific magic numbers
        common_magic_numbers = {}
        for match in matches:
            common_magic_numbers[match] = common_magic_numbers.get(match, 0) + 1
        
        # Report if magic number appears multiple times
        for num, count in common_magic_numbers.items():
            if count >= 3 and num not in ['0', '1', '2']:
                smells.append(CodeSmell(
                    name="Magic Number",
                    severity=Severity.LOW,
                    line_number=1,
                    column=0,
                    description=f"Magic number '{num}' appears {count} times",
                    suggestion="Replace magic numbers with named constants",
                    code_snippet=num,
                ))
        
        return smells[:3]  # Limit to 3 magic number reports
    
    def _detect_deep_nesting(self, file_analysis: FileAnalysis) -> List[CodeSmell]:
        """Detect deeply nested code blocks"""
        smells = []
        
        lines = file_analysis.content.split('\n')
        max_nesting = 0
        max_nesting_line = 0
        
        for i, line in enumerate(lines):
            # Count indentation level (simplified)
            stripped_line = line.lstrip()
            if stripped_line:
                nesting_level = (len(line) - len(stripped_line)) // 4
                if nesting_level > max_nesting:
                    max_nesting = nesting_level
                    max_nesting_line = i + 1
        
        if max_nesting > 5:
            smells.append(CodeSmell(
                name="Deep Nesting",
                severity=Severity.MEDIUM,
                line_number=max_nesting_line,
                column=0,
                description=f"Code has {max_nesting} levels of nesting, making it hard to read",
                suggestion="Extract nested blocks into separate functions or use early returns",
                code_snippet="Nested block",
            ))
        
        return smells
    
    def _detect_catch_all_exceptions(self, file_analysis: FileAnalysis) -> List[CodeSmell]:
        """Detect bare except/catch blocks"""
        smells = []
        
        content = file_analysis.content
        
        # Python: bare except
        if re.search(r'except\s*:\s*$', content, re.MULTILINE):
            smells.append(CodeSmell(
                name="Catch-All Exception Handler",
                severity=Severity.HIGH,
                line_number=1,
                column=0,
                description="Bare except clause catches all exceptions, including system exits",
                suggestion="Catch specific exceptions: 'except ValueError:' or 'except (ValueError, TypeError):'",
                code_snippet="except:",
            ))
        
        # Python: pass in except
        if re.search(r'except.*:\s*pass\s*$', content, re.MULTILINE):
            smells.append(CodeSmell(
                name="Silent Exception",
                severity=Severity.HIGH,
                line_number=1,
                column=0,
                description="Exception is silently ignored with 'pass'",
                suggestion="Log the exception or handle it explicitly",
                code_snippet="except: pass",
            ))
        
        return smells
    
    def _detect_unused_imports(self, file_analysis: FileAnalysis) -> List[CodeSmell]:
        """Detect unused imports"""
        smells = []
        
        for import_name in file_analysis.imports:
            # Simple check: see if import name appears in code
            base_name = import_name.split('.')[-1]
            if base_name not in file_analysis.content or file_analysis.content.count(base_name) == 1:
                smells.append(CodeSmell(
                    name="Unused Import",
                    severity=Severity.LOW,
                    line_number=1,
                    column=0,
                    description=f"Import '{import_name}' doesn't appear to be used",
                    suggestion="Remove unused imports to reduce complexity",
                    code_snippet=f"import {import_name}",
                ))
        
        return smells[:2]  # Limit to 2 reports
    
    def _detect_callback_hell(self, file_analysis: FileAnalysis) -> List[CodeSmell]:
        """Detect callback hell/deeply nested callbacks"""
        smells = []
        
        content = file_analysis.content
        
        # TypeScript/JavaScript pattern: multiple nested callbacks
        if re.search(r'\(\s*\(.*?\)\s*=>\s*\{.*?\(\s*\(.*?\)\s*=>\s*\{', content, re.DOTALL):
            smells.append(CodeSmell(
                name="Callback Hell",
                severity=Severity.MEDIUM,
                line_number=1,
                column=0,
                description="Code exhibits callback hell with deeply nested callbacks",
                suggestion="Use async/await or Promise chains instead of deeply nested callbacks",
                code_snippet="((data) => { ... (callback) => { ... }})",
            ))
        
        return smells
    
    def _detect_multiple_responsibilities(self, file_analysis: FileAnalysis) -> List[CodeSmell]:
        """Detect classes/functions with multiple responsibilities"""
        smells = []
        
        for cls in file_analysis.classes:
            # If class has methods for I/O, processing, and validation, it violates SRP
            io_methods = sum(1 for m in cls.methods if any(x in m.name.lower() for x in ['load', 'save', 'read', 'write']))
            processing_methods = sum(1 for m in cls.methods if any(x in m.name.lower() for x in ['process', 'transform', 'convert']))
            validation_methods = sum(1 for m in cls.methods if any(x in m.name.lower() for x in ['validate', 'check', 'verify']))
            
            if sum([io_methods > 0, processing_methods > 0, validation_methods > 0]) >= 2:
                smells.append(CodeSmell(
                    name="Multiple Responsibilities",
                    severity=Severity.MEDIUM,
                    line_number=1,
                    column=0,
                    description=f"Class '{cls.name}' appears to handle multiple responsibilities",
                    suggestion="Follow the Single Responsibility Principle and split into focused classes",
                    code_snippet=cls.name,
                ))
        
        return smells
