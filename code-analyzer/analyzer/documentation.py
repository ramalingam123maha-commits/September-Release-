"""Documentation generation"""

from typing import List
from .models import FileAnalysis, AnalysisResult, Language


class DocumentationGenerator:
    """Generates markdown documentation from code analysis"""
    
    def generate_api_documentation(self, file_analysis: FileAnalysis) -> str:
        """Generate API documentation for a file"""
        doc = f"# API Documentation - {file_analysis.file_path}\n\n"
        
        # Overview
        doc += "## Overview\n\n"
        doc += f"- **Language**: {file_analysis.language.value}\n"
        doc += f"- **Lines of Code**: {file_analysis.metrics.lines_of_code}\n"
        doc += f"- **Functions**: {file_analysis.metrics.functions_count}\n"
        doc += f"- **Classes**: {file_analysis.metrics.classes_count}\n"
        doc += f"- **Cyclomatic Complexity**: {file_analysis.metrics.cyclomatic_complexity}\n"
        doc += f"- **Maintainability Index**: {file_analysis.metrics.maintainability_index:.1f}/100\n\n"
        
        # Classes
        if file_analysis.classes:
            doc += "## Classes\n\n"
            for cls in file_analysis.classes:
                doc += self._generate_class_doc(cls)
        
        # Functions
        if file_analysis.functions:
            doc += "## Functions\n\n"
            for func in file_analysis.functions:
                doc += self._generate_function_doc(func)
        
        # Imports
        if file_analysis.imports:
            doc += "## Dependencies\n\n"
            doc += "### Imports\n\n"
            for imp in file_analysis.imports:
                doc += f"- `{imp}`\n"
            doc += "\n"
        
        return doc
    
    def _generate_class_doc(self, cls) -> str:
        """Generate documentation for a class"""
        doc = f"### `class {cls.name}`\n\n"
        
        if cls.description:
            doc += f"{cls.description}\n\n"
        
        if cls.inherits_from:
            doc += f"**Extends**: `{cls.inherits_from}`\n\n"
        
        if cls.interfaces:
            doc += f"**Implements**: {', '.join(f'`{i}`' for i in cls.interfaces)}\n\n"
        
        # Methods
        if cls.methods:
            doc += "#### Methods\n\n"
            for method in cls.methods:
                doc += self._generate_method_doc(method)
        
        doc += "\n"
        return doc
    
    def _generate_method_doc(self, method) -> str:
        """Generate documentation for a method"""
        params = ", ".join(f"{p.name}: {p.type}" for p in method.parameters)
        doc = f"**`{method.name}({params}) -> {method.return_type}`**\n\n"
        
        if method.description:
            doc += f"{method.description}\n\n"
        
        if method.parameters:
            doc += "**Parameters**:\n"
            for param in method.parameters:
                doc += f"- `{param.name}` ({param.type})"
                if param.description:
                    doc += f": {param.description}"
                if param.default_value:
                    doc += f" = {param.default_value}"
                doc += "\n"
            doc += "\n"
        
        doc += f"**Returns**: `{method.return_type}`\n\n"
        
        return doc
    
    def _generate_function_doc(self, func) -> str:
        """Generate documentation for a function"""
        params = ", ".join(f"{p.name}: {p.type}" for p in func.parameters)
        doc = f"### `{func.name}({params}) -> {func.return_type}`\n\n"
        
        if func.description:
            doc += f"{func.description}\n\n"
        
        if func.parameters:
            doc += "**Parameters**:\n"
            for param in func.parameters:
                doc += f"- `{param.name}` (`{param.type}`)"
                if param.description:
                    doc += f": {param.description}"
                doc += "\n"
            doc += "\n"
        
        doc += f"**Returns**: `{func.return_type}`\n\n"
        
        # Example usage
        doc += f"""**Example**:
```python
result = {func.name}({', '.join(f'{p.name}={p.name}' for p in func.parameters[:2])})
```

"""
        
        return doc
    
    def generate_architecture_diagram(self, analysis: AnalysisResult) -> str:
        """Generate architecture diagram in markdown"""
        doc = "# System Architecture\n\n"
        
        doc += "## Component Overview\n\n"
        doc += "```mermaid\ngraph TB\n"
        
        # Add all classes as nodes
        for file_analysis in analysis.files:
            for cls in file_analysis.classes:
                label = cls.name.replace('_', ' ')
                doc += f'    {cls.name}["{label}"]\n'
        
        # Add relationships
        for file_analysis in analysis.files:
            for cls in file_analysis.classes:
                if cls.inherits_from:
                    doc += f"    {cls.name} -->|extends| {cls.inherits_from}\n"
                if cls.interfaces:
                    for interface in cls.interfaces:
                        doc += f"    {cls.name} -->|implements| {interface}\n"
        
        doc += "```\n\n"
        
        # Module structure
        doc += "## Module Structure\n\n"
        
        modules = {}
        for file_analysis in analysis.files:
            module = file_analysis.file_path.split('/')[-1]
            if module not in modules:
                modules[module] = {
                    'classes': [],
                    'functions': [],
                    'metrics': file_analysis.metrics
                }
            modules[module]['classes'].extend([c.name for c in file_analysis.classes])
            modules[module]['functions'].extend([f.name for f in file_analysis.functions])
        
        for module_name, data in modules.items():
            doc += f"### `{module_name}`\n\n"
            doc += f"- **Classes**: {', '.join(f'`{c}`' for c in data['classes']) if data['classes'] else 'None'}\n"
            doc += f"- **Functions**: {', '.join(f'`{f}`' for f in data['functions'][:5]) if data['functions'] else 'None'}\n"
            if len(data['functions']) > 5:
                doc += f"  ... and {len(data['functions']) - 5} more\n"
            doc += f"- **LOC**: {data['metrics'].lines_of_code}\n"
            doc += f"- **Complexity**: {data['metrics'].cyclomatic_complexity}\n\n"
        
        # Data flow
        doc += "## Data Flow\n\n"
        doc += "```mermaid\ngraph LR\n"
        doc += '    Input["Input Data"]\n'
        doc += '    Processing["Processing\nLayer"]\n'
        doc += '    Storage["Storage\nLayer"]\n'
        doc += '    Output["Output Data"]\n'
        doc += '    Input --> Processing\n'
        doc += '    Processing --> Storage\n'
        doc += '    Storage --> Output\n'
        doc += "```\n\n"
        
        return doc
    
    def generate_code_smells_report(self, analysis: AnalysisResult) -> str:
        """Generate code smells report"""
        doc = "# Code Smells & Anti-Patterns Report\n\n"
        
        if not analysis.global_smells:
            doc += "✅ No significant code smells detected!\n\n"
            return doc
        
        # Group by severity
        smells_by_severity = {}
        for smell in analysis.global_smells:
            if smell.severity not in smells_by_severity:
                smells_by_severity[smell.severity] = []
            smells_by_severity[smell.severity].append(smell)
        
        # Critical
        if 'critical' in [s.value for s in smells_by_severity.keys()]:
            doc += "## 🔴 Critical Issues\n\n"
            for smell in [s for s, sev in zip(smells_by_severity.keys(), smells_by_severity.values()) if sev.severity.value == 'critical']:
                for s in smells_by_severity[smell]:
                    doc += f"### {s.name}\n\n"
                    doc += f"**Severity**: Critical\n\n"
                    doc += f"**Description**: {s.description}\n\n"
                    doc += f"**Location**: Line {s.line_number}\n\n"
                    doc += f"**Code**:\n```\n{s.code_snippet}\n```\n\n"
                    doc += f"**Suggestion**: {s.suggestion}\n\n"
        
        # High
        high_smells = [s for severities in smells_by_severity.values() for s in severities if s.severity.value == 'high']
        if high_smells:
            doc += "## 🟠 High Priority\n\n"
            for smell in high_smells[:5]:
                doc += f"### {smell.name}\n\n"
                doc += f"**Description**: {smell.description}\n\n"
                doc += f"**Location**: Line {smell.line_number}\n\n"
                doc += f"**Suggestion**: {smell.suggestion}\n\n"
        
        # Medium
        medium_smells = [s for severities in smells_by_severity.values() for s in severities if s.severity.value == 'medium']
        if medium_smells:
            doc += f"## 🟡 Medium Priority\n\n"
            doc += f"Found {len(medium_smells)} medium-priority issues.\n\n"
        
        return doc
    
    def generate_refactoring_suggestions(self, analysis: AnalysisResult) -> str:
        """Generate refactoring suggestions report"""
        doc = "# Refactoring Suggestions\n\n"
        
        if not analysis.global_suggestions:
            doc += "✅ No refactoring suggestions at this time.\n\n"
            return doc
        
        for suggestion in analysis.global_suggestions:
            doc += f"## {suggestion.title}\n\n"
            doc += f"**Location**: {suggestion.location}\n\n"
            doc += f"**Severity**: {suggestion.severity.value.upper()}\n\n"
            doc += f"**Description**: {suggestion.description}\n\n"
            
            doc += "### Current Code\n\n"
            doc += f"```python\n{suggestion.current_code}\n```\n\n"
            
            doc += "### Refactored Code\n\n"
            doc += f"```python\n{suggestion.refactored_code}\n```\n\n"
            
            doc += f"### Why\n\n"
            doc += f"{suggestion.explanation}\n\n"
            
            doc += "### Benefits\n\n"
            for benefit in suggestion.benefits:
                doc += f"- ✨ {benefit}\n"
            doc += "\n"
        
        return doc
