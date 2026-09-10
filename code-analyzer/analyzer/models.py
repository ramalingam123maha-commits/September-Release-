"""Data models for code analysis"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class Language(Enum):
    """Supported programming languages"""
    PYTHON = "python"
    JAVA = "java"
    TYPESCRIPT = "typescript"
    CPP = "cpp"


class Severity(Enum):
    """Issue severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class Parameter:
    """Function parameter"""
    name: str
    type: str
    description: str = ""
    default_value: Optional[str] = None


@dataclass
class FunctionSignature:
    """Function signature information"""
    name: str
    parameters: List[Parameter]
    return_type: str
    description: str = ""
    decorators: List[str] = None
    is_async: bool = False
    is_static: bool = False
    
    def __post_init__(self):
        if self.decorators is None:
            self.decorators = []


@dataclass
class CodeMetrics:
    """Code complexity and quality metrics"""
    lines_of_code: int
    lines_of_comment: int
    cyclomatic_complexity: int
    cognitive_complexity: int
    maintainability_index: float
    halstead_volume: float
    functions_count: int
    classes_count: int
    imports_count: int
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CodeSmell:
    """Detected code smell or anti-pattern"""
    name: str
    severity: Severity
    line_number: int
    column: int
    description: str
    suggestion: str
    code_snippet: str


@dataclass
class RefactoringSuggestion:
    """Refactoring recommendation"""
    title: str
    description: str
    severity: Severity
    current_code: str
    refactored_code: str
    explanation: str
    benefits: List[str]
    location: str


@dataclass
class ClassInfo:
    """Class/Type information"""
    name: str
    methods: List[FunctionSignature]
    properties: List[str]
    inherits_from: Optional[str] = None
    interfaces: List[str] = None
    description: str = ""
    
    def __post_init__(self):
        if self.interfaces is None:
            self.interfaces = []


@dataclass
class FileAnalysis:
    """Complete analysis of a single file"""
    file_path: str
    language: Language
    content: str
    functions: List[FunctionSignature]
    classes: List[ClassInfo]
    metrics: CodeMetrics
    smells: List[CodeSmell]
    imports: List[str]
    exports: List[str]


@dataclass
class AnalysisResult:
    """Complete analysis result for project/directory"""
    files: List[FileAnalysis]
    total_metrics: CodeMetrics
    architecture: Dict[str, Any]
    global_smells: List[CodeSmell]
    global_suggestions: List[RefactoringSuggestion]
    statistics: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "files": [self._file_to_dict(f) for f in self.files],
            "total_metrics": self.total_metrics.to_dict(),
            "architecture": self.architecture,
            "global_smells": [self._smell_to_dict(s) for s in self.global_smells],
            "global_suggestions": [self._suggestion_to_dict(s) for s in self.global_suggestions],
            "statistics": self.statistics,
        }
    
    @staticmethod
    def _file_to_dict(file_analysis: FileAnalysis) -> Dict[str, Any]:
        return {
            "file_path": file_analysis.file_path,
            "language": file_analysis.language.value,
            "functions": [asdict(f) for f in file_analysis.functions],
            "classes": [asdict(c) for c in file_analysis.classes],
            "metrics": file_analysis.metrics.to_dict(),
            "smells": [asdict(s) for s in file_analysis.smells],
        }
    
    @staticmethod
    def _smell_to_dict(smell: CodeSmell) -> Dict[str, Any]:
        return asdict(smell) | {"severity": smell.severity.value}
    
    @staticmethod
    def _suggestion_to_dict(suggestion: RefactoringSuggestion) -> Dict[str, Any]:
        return asdict(suggestion) | {"severity": suggestion.severity.value}
