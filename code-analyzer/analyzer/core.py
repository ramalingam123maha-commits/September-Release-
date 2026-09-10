"""Core code analysis engine"""

import os
import json
from pathlib import Path
from typing import List, Optional
from .models import (
    Language,
    FileAnalysis,
    AnalysisResult,
    CodeMetrics,
)
from .parsers import get_parser
from .smell_detector import SmellDetector
from .refactoring import RefactoringSuggester
from .documentation import DocumentationGenerator


class CodeAnalyzer:
    """Main code analyzer"""
    
    # Language file extensions mapping
    LANGUAGE_EXTENSIONS = {
        '.py': Language.PYTHON,
        '.java': Language.JAVA,
        '.ts': Language.TYPESCRIPT,
        '.tsx': Language.TYPESCRIPT,
        '.js': Language.TYPESCRIPT,
        '.jsx': Language.TYPESCRIPT,
        '.cpp': Language.CPP,
        '.cc': Language.CPP,
        '.h': Language.CPP,
        '.hpp': Language.CPP,
    }
    
    def __init__(self):
        self.smell_detector = SmellDetector()
        self.refactoring_suggester = RefactoringSuggester()
        self.doc_generator = DocumentationGenerator()
    
    def analyze_file(self, file_path: str) -> Optional[FileAnalysis]:
        """Analyze a single file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
            return None
        
        # Detect language
        language = self._detect_language(file_path)
        if not language:
            return None
        
        # Parse code
        try:
            parser = get_parser(language, content, file_path)
            
            functions = parser.extract_functions()
            classes = parser.extract_classes()
            imports = parser.extract_imports()
            metrics = parser.calculate_metrics()
            
            # Create file analysis
            file_analysis = FileAnalysis(
                file_path=file_path,
                language=language,
                content=content,
                functions=functions,
                classes=classes,
                metrics=metrics,
                smells=[],
                imports=imports,
                exports=[],
            )
            
            # Detect smells
            file_analysis.smells = self.smell_detector.detect_smells(file_analysis)
            
            return file_analysis
        
        except Exception as e:
            print(f"Error analyzing file {file_path}: {e}")
            return None
    
    def analyze_directory(self, directory_path: str, recursive: bool = True) -> AnalysisResult:
        """Analyze all files in a directory"""
        files = []
        
        # Find all source files
        for ext, language in self.LANGUAGE_EXTENSIONS.items():
            if recursive:
                pattern = f"**/*{ext}"
            else:
                pattern = f"*{ext}"
            
            for file_path in Path(directory_path).glob(pattern):
                analysis = self.analyze_file(str(file_path))
                if analysis:
                    files.append(analysis)
        
        # Generate aggregate analysis
        return self._create_analysis_result(files)
    
    def analyze_path(self, path: str, recursive: bool = True) -> AnalysisResult:
        """Analyze a file or directory"""
        if os.path.isfile(path):
            analysis = self.analyze_file(path)
            return self._create_analysis_result([analysis] if analysis else [])
        else:
            return self.analyze_directory(path, recursive)
    
    def _detect_language(self, file_path: str) -> Optional[Language]:
        """Detect language from file extension"""
        ext = Path(file_path).suffix
        return self.LANGUAGE_EXTENSIONS.get(ext)
    
    def _create_analysis_result(self, files: List[FileAnalysis]) -> AnalysisResult:
        """Create aggregate analysis result"""
        if not files:
            # Return empty result
            empty_metrics = CodeMetrics(
                lines_of_code=0,
                lines_of_comment=0,
                cyclomatic_complexity=0,
                cognitive_complexity=0,
                maintainability_index=100,
                halstead_volume=0,
                functions_count=0,
                classes_count=0,
                imports_count=0,
            )
            return AnalysisResult(
                files=[],
                total_metrics=empty_metrics,
                architecture={},
                global_smells=[],
                global_suggestions=[],
                statistics={},
            )
        
        # Aggregate metrics
        total_loc = sum(f.metrics.lines_of_code for f in files)
        total_comments = sum(f.metrics.lines_of_comment for f in files)
        avg_cc = sum(f.metrics.cyclomatic_complexity for f in files) / len(files) if files else 0
        total_functions = sum(f.metrics.functions_count for f in files)
        total_classes = sum(f.metrics.classes_count for f in files)
        total_imports = sum(f.metrics.imports_count for f in files)
        
        avg_maintainability = sum(f.metrics.maintainability_index for f in files) / len(files) if files else 100
        
        total_metrics = CodeMetrics(
            lines_of_code=total_loc,
            lines_of_comment=total_comments,
            cyclomatic_complexity=int(avg_cc),
            cognitive_complexity=int(avg_cc * 1.2),
            maintainability_index=avg_maintainability,
            halstead_volume=sum(f.metrics.halstead_volume for f in files),
            functions_count=total_functions,
            classes_count=total_classes,
            imports_count=total_imports,
        )
        
        # Collect all smells and suggestions
        all_smells = []
        for file_analysis in files:
            all_smells.extend(file_analysis.smells)
        
        all_suggestions = []
        for file_analysis in files:
            all_suggestions.extend(self.refactoring_suggester.generate_suggestions(file_analysis))
        
        # Generate statistics
        statistics = {
            'total_files': len(files),
            'by_language': self._count_by_language(files),
            'quality_score': self._calculate_quality_score(total_metrics),
            'complexity_distribution': self._get_complexity_distribution(files),
        }
        
        # Generate architecture
        architecture = {
            'modules': len(set(f.file_path.split('/')[-1] for f in files)),
            'classes': total_classes,
            'functions': total_functions,
            'dependencies': total_imports,
        }
        
        return AnalysisResult(
            files=files,
            total_metrics=total_metrics,
            architecture=architecture,
            global_smells=all_smells,
            global_suggestions=all_suggestions,
            statistics=statistics,
        )
    
    def _count_by_language(self, files: List[FileAnalysis]) -> dict:
        """Count files by language"""
        counts = {}
        for file_analysis in files:
            lang = file_analysis.language.value
            counts[lang] = counts.get(lang, 0) + 1
        return counts
    
    def _calculate_quality_score(self, metrics: CodeMetrics) -> float:
        """Calculate overall code quality score (0-100)"""
        score = metrics.maintainability_index
        
        # Adjust based on complexity
        if metrics.cyclomatic_complexity > 10:
            score -= 10
        if metrics.cyclomatic_complexity > 20:
            score -= 10
        
        return max(0, min(100, score))
    
    def _get_complexity_distribution(self, files: List[FileAnalysis]) -> dict:
        """Get distribution of complexity levels"""
        low = sum(1 for f in files if f.metrics.cyclomatic_complexity <= 5)
        medium = sum(1 for f in files if 5 < f.metrics.cyclomatic_complexity <= 10)
        high = sum(1 for f in files if f.metrics.cyclomatic_complexity > 10)
        
        return {
            'low': low,
            'medium': medium,
            'high': high,
        }


class AnalysisReporter:
    """Generates analysis reports"""
    
    def __init__(self, analysis: AnalysisResult):
        self.analysis = analysis
        self.doc_generator = DocumentationGenerator()
    
    def generate_full_report(self, output_dir: str) -> None:
        """Generate all report files"""
        os.makedirs(output_dir, exist_ok=True)
        
        # API documentation
        api_doc = "# API Documentation\n\n"
        for file_analysis in self.analysis.files:
            api_doc += self.doc_generator.generate_api_documentation(file_analysis)
            api_doc += "\n---\n\n"
        
        with open(os.path.join(output_dir, 'API_DOCUMENTATION.md'), 'w') as f:
            f.write(api_doc)
        
        # Architecture
        arch_doc = self.doc_generator.generate_architecture_diagram(self.analysis)
        with open(os.path.join(output_dir, 'ARCHITECTURE.md'), 'w') as f:
            f.write(arch_doc)
        
        # Code smells
        smells_doc = self.doc_generator.generate_code_smells_report(self.analysis)
        with open(os.path.join(output_dir, 'CODE_SMELLS.md'), 'w') as f:
            f.write(smells_doc)
        
        # Refactoring suggestions
        suggestions_doc = self.doc_generator.generate_refactoring_suggestions(self.analysis)
        with open(os.path.join(output_dir, 'REFACTORING_SUGGESTIONS.md'), 'w') as f:
            f.write(suggestions_doc)
        
        # Summary report
        summary = self._generate_summary()
        with open(os.path.join(output_dir, 'ANALYSIS_SUMMARY.md'), 'w') as f:
            f.write(summary)
        
        # JSON output
        with open(os.path.join(output_dir, 'analysis.json'), 'w') as f:
            json.dump(self.analysis.to_dict(), f, indent=2, default=str)
    
    def _generate_summary(self) -> str:
        """Generate summary report"""
        doc = "# Code Analysis Summary\n\n"
        
        doc += "## Overview\n\n"
        doc += f"- **Total Files**: {self.analysis.statistics['total_files']}\n"
        doc += f"- **Languages**: {', '.join(self.analysis.statistics['by_language'].keys())}\n"
        doc += f"- **Total LOC**: {self.analysis.total_metrics.lines_of_code}\n"
        doc += f"- **Total Functions**: {self.analysis.total_metrics.functions_count}\n"
        doc += f"- **Total Classes**: {self.analysis.total_metrics.classes_count}\n\n"
        
        doc += "## Metrics\n\n"
        doc += f"- **Quality Score**: {self.analysis.statistics['quality_score']:.1f}/100\n"
        doc += f"- **Avg Cyclomatic Complexity**: {self.analysis.total_metrics.cyclomatic_complexity}\n"
        doc += f"- **Avg Maintainability Index**: {self.analysis.total_metrics.maintainability_index:.1f}/100\n"
        doc += f"- **Lines of Comments**: {self.analysis.total_metrics.lines_of_comment}\n\n"
        
        doc += "## Issues Found\n\n"
        doc += f"- **Code Smells**: {len(self.analysis.global_smells)}\n"
        doc += f"- **Refactoring Suggestions**: {len(self.analysis.global_suggestions)}\n\n"
        
        return doc
