"""Command-line interface for code analyzer"""

import sys
import os
import json
from pathlib import Path
from analyzer.core import CodeAnalyzer, AnalysisReporter


def print_header(text: str):
    """Print formatted header"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")


def print_result(analysis_result):
    """Print analysis result summary"""
    print_header("Analysis Results")
    
    print(f"📊 Code Metrics:")
    print(f"   • Files analyzed: {analysis_result.statistics['total_files']}")
    print(f"   • Languages: {', '.join(analysis_result.statistics['by_language'].keys())}")
    print(f"   • Total LOC: {analysis_result.total_metrics.lines_of_code}")
    print(f"   • Functions: {analysis_result.total_metrics.functions_count}")
    print(f"   • Classes: {analysis_result.total_metrics.classes_count}")
    
    print(f"\n📈 Quality Metrics:")
    print(f"   • Quality Score: {analysis_result.statistics['quality_score']:.1f}/100")
    print(f"   • Cyclomatic Complexity: {analysis_result.total_metrics.cyclomatic_complexity}")
    print(f"   • Maintainability Index: {analysis_result.total_metrics.maintainability_index:.1f}/100")
    
    print(f"\n⚠️  Issues:")
    print(f"   • Code Smells: {len(analysis_result.global_smells)}")
    print(f"   • Refactoring Suggestions: {len(analysis_result.global_suggestions)}")
    
    if analysis_result.global_smells:
        print(f"\n🔍 Top Code Smells:")
        for smell in analysis_result.global_smells[:5]:
            print(f"   • {smell.name} ({smell.severity.value}) - {smell.description[:50]}...")
    
    if analysis_result.global_suggestions:
        print(f"\n💡 Top Refactoring Suggestions:")
        for suggestion in analysis_result.global_suggestions[:3]:
            print(f"   • {suggestion.title}: {suggestion.description[:50]}...")


def analyze_command(path, language=None, recursive=True):
    """Run analysis on a path"""
    print_header(f"Analyzing {path}")
    
    if not os.path.exists(path):
        print(f"❌ Error: Path '{path}' does not exist")
        return 1
    
    analyzer = CodeAnalyzer()
    
    print("🔍 Scanning files...")
    result = analyzer.analyze_path(path, recursive=recursive)
    
    if not result.files:
        print("❌ No source files found")
        return 1
    
    print_result(result)
    return 0


def report_command(path, output_dir="./analysis_report"):
    """Generate full analysis report"""
    print_header(f"Generating Report for {path}")
    
    if not os.path.exists(path):
        print(f"❌ Error: Path '{path}' does not exist")
        return 1
    
    analyzer = CodeAnalyzer()
    reporter = AnalysisReporter(analyzer.analyze_path(path))
    
    print(f"📝 Generating reports in {output_dir}...")
    reporter.generate_full_report(output_dir)
    
    print(f"\n✅ Reports generated successfully!")
    print(f"\n📄 Generated files:")
    print(f"   • API_DOCUMENTATION.md")
    print(f"   • ARCHITECTURE.md")
    print(f"   • CODE_SMELLS.md")
    print(f"   • REFACTORING_SUGGESTIONS.md")
    print(f"   • ANALYSIS_SUMMARY.md")
    print(f"   • analysis.json")
    
    return 0


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print_header("Code Analyzer - Usage")
        print("Usage: python -m analyzer <command> <path> [options]\n")
        print("Commands:")
        print("  analyze   - Analyze code and print summary")
        print("  report    - Generate comprehensive analysis report\n")
        print("Examples:")
        print("  python -m analyzer analyze /path/to/project")
        print("  python -m analyzer report /path/to/project --output ./report")
        return 1
    
    command = sys.argv[1]
    path = sys.argv[2] if len(sys.argv) > 2 else "."
    
    if command == "analyze":
        return analyze_command(path)
    elif command == "report":
        output = sys.argv[4] if len(sys.argv) > 4 and sys.argv[3] == "--output" else "./analysis_report"
        return report_command(path, output)
    else:
        print(f"❌ Unknown command: {command}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
