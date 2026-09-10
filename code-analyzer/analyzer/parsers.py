"""Language-specific code parsers"""

import re
from abc import ABC, abstractmethod
from typing import List, Optional
from .models import (
    Language,
    FunctionSignature,
    Parameter,
    ClassInfo,
    CodeMetrics,
)


class BaseParser(ABC):
    """Abstract base parser"""
    
    def __init__(self, content: str, file_path: str):
        self.content = content
        self.file_path = file_path
        self.lines = content.split('\n')
    
    @abstractmethod
    def extract_functions(self) -> List[FunctionSignature]:
        pass
    
    @abstractmethod
    def extract_classes(self) -> List[ClassInfo]:
        pass
    
    @abstractmethod
    def extract_imports(self) -> List[str]:
        pass
    
    @abstractmethod
    def calculate_metrics(self) -> CodeMetrics:
        pass
    
    def _count_lines_of_code(self) -> int:
        """Count non-empty, non-comment lines"""
        count = 0
        for line in self.lines:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and not stripped.startswith('//'):
                count += 1
        return count
    
    def _count_comment_lines(self) -> int:
        """Count comment lines"""
        count = 0
        in_block_comment = False
        
        for line in self.lines:
            stripped = line.strip()
            
            # Python/Java/C++ block comments
            if '"""' in stripped or "'''" in stripped:
                in_block_comment = not in_block_comment
                count += 1
            elif in_block_comment:
                count += 1
            elif stripped.startswith('#') or stripped.startswith('//'):
                count += 1
        
        return count
    
    def _calculate_cyclomatic_complexity(self, code: str) -> int:
        """Calculate cyclomatic complexity"""
        complexity = 1
        
        # Count decision points
        decision_keywords = ['if', 'else', 'for', 'while', 'case', 'catch', 'and', 'or']
        for keyword in decision_keywords:
            complexity += len(re.findall(rf'\b{keyword}\b', code))
        
        return complexity


class PythonParser(BaseParser):
    """Python code parser"""
    
    def extract_functions(self) -> List[FunctionSignature]:
        """Extract function signatures from Python code"""
        functions = []
        
        # Match function definitions
        pattern = r'^def\s+(\w+)\s*\((.*?)\)\s*(?:->|:)'
        
        for match in re.finditer(pattern, self.content, re.MULTILINE):
            name = match.group(1)
            params_str = match.group(2)
            
            # Parse parameters
            parameters = self._parse_python_params(params_str)
            
            # Extract return type from type hints
            return_type_match = re.search(rf'def\s+{name}.*?\)\s*->\s*([^:]+):', self.content)
            return_type = return_type_match.group(1).strip() if return_type_match else "Any"
            
            functions.append(FunctionSignature(
                name=name,
                parameters=parameters,
                return_type=return_type,
            ))
        
        return functions
    
    def extract_classes(self) -> List[ClassInfo]:
        """Extract class definitions from Python code"""
        classes = []
        
        pattern = r'^class\s+(\w+)(?:\(([^)]*)\))?:'
        
        for match in re.finditer(pattern, self.content, re.MULTILINE):
            name = match.group(1)
            inherits = match.group(2).strip() if match.group(2) else None
            
            # Extract methods
            methods = []
            for func in self.extract_functions():
                methods.append(func)
            
            classes.append(ClassInfo(
                name=name,
                methods=methods,
                properties=[],
                inherits_from=inherits,
            ))
        
        return classes
    
    def extract_imports(self) -> List[str]:
        """Extract imports from Python code"""
        imports = []
        
        import_patterns = [
            r'^import\s+([^\s;]+)',
            r'^from\s+([^\s]+)\s+import',
        ]
        
        for pattern in import_patterns:
            for match in re.finditer(pattern, self.content, re.MULTILINE):
                imports.append(match.group(1))
        
        return list(set(imports))
    
    def calculate_metrics(self) -> CodeMetrics:
        """Calculate code metrics"""
        loc = self._count_lines_of_code()
        comments = self._count_comment_lines()
        functions = len(self.extract_functions())
        classes = len(self.extract_classes())
        imports = len(self.extract_imports())
        
        cc = self._calculate_cyclomatic_complexity(self.content)
        
        # Simple maintainability index (0-100)
        maintainability = max(0, 100 - (cc * 2) - (loc / 10))
        
        return CodeMetrics(
            lines_of_code=loc,
            lines_of_comment=comments,
            cyclomatic_complexity=cc,
            cognitive_complexity=int(cc * 1.2),
            maintainability_index=min(100, maintainability),
            halstead_volume=len(self.content) / 1000,
            functions_count=functions,
            classes_count=classes,
            imports_count=imports,
        )
    
    def _parse_python_params(self, params_str: str) -> List[Parameter]:
        """Parse Python function parameters"""
        parameters = []
        
        if not params_str.strip():
            return parameters
        
        for param in params_str.split(','):
            param = param.strip()
            if not param:
                continue
            
            # Handle default values and type hints
            if ':' in param:
                name, type_with_default = param.split(':', 1)
                name = name.strip()
                
                if '=' in type_with_default:
                    param_type, default = type_with_default.split('=', 1)
                    param_type = param_type.strip()
                    default = default.strip()
                else:
                    param_type = type_with_default.strip()
                    default = None
            else:
                name = param.split('=')[0].strip()
                param_type = 'Any'
                default = param.split('=')[1].strip() if '=' in param else None
            
            parameters.append(Parameter(
                name=name,
                type=param_type,
                default_value=default,
            ))
        
        return parameters


class TypeScriptParser(BaseParser):
    """TypeScript/JavaScript code parser"""
    
    def extract_functions(self) -> List[FunctionSignature]:
        """Extract function signatures from TypeScript"""
        functions = []
        
        patterns = [
            r'(?:async\s+)?(?:function|const|let|var)\s+(\w+)\s*(?:\(([^)]*)\))?.*?(?::\s*([^{;=]+))?',
            r'(?:public|private|protected)?\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*([^{;]+))?',
        ]
        
        for pattern in patterns:
            for match in re.finditer(pattern, self.content):
                name = match.group(1)
                params_str = match.group(2) or ""
                return_type = match.group(3) or "void"
                
                parameters = self._parse_typescript_params(params_str)
                
                functions.append(FunctionSignature(
                    name=name,
                    parameters=parameters,
                    return_type=return_type.strip(),
                ))
        
        return functions
    
    def extract_classes(self) -> List[ClassInfo]:
        """Extract class definitions from TypeScript"""
        classes = []
        
        pattern = r'(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?'
        
        for match in re.finditer(pattern, self.content):
            name = match.group(1)
            inherits = match.group(2)
            interfaces = match.group(3).split(',') if match.group(3) else []
            
            methods = []
            for func in self.extract_functions():
                methods.append(func)
            
            classes.append(ClassInfo(
                name=name,
                methods=methods,
                properties=[],
                inherits_from=inherits,
                interfaces=[i.strip() for i in interfaces],
            ))
        
        return classes
    
    def extract_imports(self) -> List[str]:
        """Extract imports from TypeScript"""
        imports = []
        
        patterns = [
            r'^import\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]',
            r'^import\s+[\'"]([^\'"]+)[\'"]',
        ]
        
        for pattern in patterns:
            for match in re.finditer(pattern, self.content, re.MULTILINE):
                imports.append(match.group(1))
        
        return list(set(imports))
    
    def calculate_metrics(self) -> CodeMetrics:
        """Calculate code metrics"""
        loc = self._count_lines_of_code()
        comments = self._count_comment_lines()
        functions = len(self.extract_functions())
        classes = len(self.extract_classes())
        imports = len(self.extract_imports())
        
        cc = self._calculate_cyclomatic_complexity(self.content)
        
        maintainability = max(0, 100 - (cc * 2) - (loc / 10))
        
        return CodeMetrics(
            lines_of_code=loc,
            lines_of_comment=comments,
            cyclomatic_complexity=cc,
            cognitive_complexity=int(cc * 1.2),
            maintainability_index=min(100, maintainability),
            halstead_volume=len(self.content) / 1000,
            functions_count=functions,
            classes_count=classes,
            imports_count=imports,
        )
    
    def _parse_typescript_params(self, params_str: str) -> List[Parameter]:
        """Parse TypeScript function parameters"""
        parameters = []
        
        if not params_str.strip():
            return parameters
        
        for param in params_str.split(','):
            param = param.strip()
            if not param:
                continue
            
            parts = param.split(':')
            name = parts[0].strip()
            param_type = parts[1].strip() if len(parts) > 1 else 'any'
            
            # Remove default value from type
            if '=' in param_type:
                param_type = param_type.split('=')[0].strip()
            
            parameters.append(Parameter(
                name=name,
                type=param_type,
            ))
        
        return parameters


class JavaParser(BaseParser):
    """Java code parser"""
    
    def extract_functions(self) -> List[FunctionSignature]:
        """Extract method signatures from Java"""
        functions = []
        
        pattern = r'(?:public|private|protected)?\s+(?:static\s+)?(?:synchronized\s+)?(\w+)\s+(\w+)\s*\((.*?)\)'
        
        for match in re.finditer(pattern, self.content):
            return_type = match.group(1)
            name = match.group(2)
            params_str = match.group(3)
            
            parameters = self._parse_java_params(params_str)
            
            functions.append(FunctionSignature(
                name=name,
                parameters=parameters,
                return_type=return_type,
            ))
        
        return functions
    
    def extract_classes(self) -> List[ClassInfo]:
        """Extract class definitions from Java"""
        classes = []
        
        pattern = r'(?:public\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?'
        
        for match in re.finditer(pattern, self.content):
            name = match.group(1)
            inherits = match.group(2)
            interfaces = match.group(3).split(',') if match.group(3) else []
            
            methods = []
            for func in self.extract_functions():
                methods.append(func)
            
            classes.append(ClassInfo(
                name=name,
                methods=methods,
                properties=[],
                inherits_from=inherits,
                interfaces=[i.strip() for i in interfaces],
            ))
        
        return classes
    
    def extract_imports(self) -> List[str]:
        """Extract imports from Java"""
        imports = []
        
        pattern = r'^import\s+([^\s;]+)'
        
        for match in re.finditer(pattern, self.content, re.MULTILINE):
            imports.append(match.group(1))
        
        return list(set(imports))
    
    def calculate_metrics(self) -> CodeMetrics:
        """Calculate code metrics"""
        loc = self._count_lines_of_code()
        comments = self._count_comment_lines()
        functions = len(self.extract_functions())
        classes = len(self.extract_classes())
        imports = len(self.extract_imports())
        
        cc = self._calculate_cyclomatic_complexity(self.content)
        maintainability = max(0, 100 - (cc * 2) - (loc / 10))
        
        return CodeMetrics(
            lines_of_code=loc,
            lines_of_comment=comments,
            cyclomatic_complexity=cc,
            cognitive_complexity=int(cc * 1.2),
            maintainability_index=min(100, maintainability),
            halstead_volume=len(self.content) / 1000,
            functions_count=functions,
            classes_count=classes,
            imports_count=imports,
        )
    
    def _parse_java_params(self, params_str: str) -> List[Parameter]:
        """Parse Java method parameters"""
        parameters = []
        
        if not params_str.strip():
            return parameters
        
        for param in params_str.split(','):
            param = param.strip()
            if not param:
                continue
            
            parts = param.split()
            if len(parts) >= 2:
                param_type = ' '.join(parts[:-1])
                name = parts[-1]
            else:
                param_type = 'Object'
                name = parts[0] if parts else 'param'
            
            parameters.append(Parameter(
                name=name,
                type=param_type,
            ))
        
        return parameters


class CPPParser(BaseParser):
    """C++ code parser"""
    
    def extract_functions(self) -> List[FunctionSignature]:
        """Extract function signatures from C++"""
        functions = []
        
        pattern = r'(?:inline\s+)?(?:static\s+)?(\w+(?:\s*\*)?)\s+(\w+)\s*\((.*?)\)'
        
        for match in re.finditer(pattern, self.content):
            return_type = match.group(1)
            name = match.group(2)
            params_str = match.group(3)
            
            parameters = self._parse_cpp_params(params_str)
            
            functions.append(FunctionSignature(
                name=name,
                parameters=parameters,
                return_type=return_type,
            ))
        
        return functions
    
    def extract_classes(self) -> List[ClassInfo]:
        """Extract class definitions from C++"""
        classes = []
        
        pattern = r'(?:class|struct)\s+(\w+)(?:\s*:\s*([^{]+))?'
        
        for match in re.finditer(pattern, self.content):
            name = match.group(1)
            inherits = match.group(2)
            
            methods = []
            for func in self.extract_functions():
                methods.append(func)
            
            classes.append(ClassInfo(
                name=name,
                methods=methods,
                properties=[],
                inherits_from=inherits.split(',')[0].strip() if inherits else None,
            ))
        
        return classes
    
    def extract_imports(self) -> List[str]:
        """Extract includes from C++"""
        imports = []
        
        patterns = [
            r'#include\s+[<"]([^>"]+)[>"]',
        ]
        
        for pattern in patterns:
            for match in re.finditer(pattern, self.content):
                imports.append(match.group(1))
        
        return list(set(imports))
    
    def calculate_metrics(self) -> CodeMetrics:
        """Calculate code metrics"""
        loc = self._count_lines_of_code()
        comments = self._count_comment_lines()
        functions = len(self.extract_functions())
        classes = len(self.extract_classes())
        imports = len(self.extract_imports())
        
        cc = self._calculate_cyclomatic_complexity(self.content)
        maintainability = max(0, 100 - (cc * 2) - (loc / 10))
        
        return CodeMetrics(
            lines_of_code=loc,
            lines_of_comment=comments,
            cyclomatic_complexity=cc,
            cognitive_complexity=int(cc * 1.2),
            maintainability_index=min(100, maintainability),
            halstead_volume=len(self.content) / 1000,
            functions_count=functions,
            classes_count=classes,
            imports_count=imports,
        )
    
    def _parse_cpp_params(self, params_str: str) -> List[Parameter]:
        """Parse C++ function parameters"""
        parameters = []
        
        if not params_str.strip() or params_str.strip() == 'void':
            return parameters
        
        for param in params_str.split(','):
            param = param.strip()
            if not param:
                continue
            
            parts = param.split()
            if len(parts) >= 2:
                param_type = ' '.join(parts[:-1])
                name = parts[-1]
            else:
                param_type = 'auto'
                name = parts[0] if parts else 'param'
            
            parameters.append(Parameter(
                name=name,
                type=param_type,
            ))
        
        return parameters


def get_parser(language: Language, content: str, file_path: str) -> BaseParser:
    """Factory function to get appropriate parser"""
    
    parsers = {
        Language.PYTHON: PythonParser,
        Language.TYPESCRIPT: TypeScriptParser,
        Language.JAVA: JavaParser,
        Language.CPP: CPPParser,
    }
    
    parser_class = parsers.get(language, PythonParser)
    return parser_class(content, file_path)
