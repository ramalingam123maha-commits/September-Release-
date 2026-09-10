"""Setup configuration for Code Analyzer"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="code-analyzer",
    version="1.0.0",
    author="Code Studio",
    description="Intelligent multi-language code analysis system",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/code-analyzer",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8+",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Software Development :: Quality Assurance",
    ],
    python_requires=">=3.8",
    install_requires=[
        "radon>=6.1",
        "pylint>=3.0.3",
        "click>=8.1.7",
        "colorama>=0.4.6",
        "pydantic>=2.5.0",
        "Jinja2>=3.1.2",
    ],
    entry_points={
        "console_scripts": [
            "code-analyzer=analyzer.__main__:main",
        ],
    },
)
