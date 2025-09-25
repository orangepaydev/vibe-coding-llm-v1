# Copilot Instructions for Python LLM Agent

## Role of the Developer
You are a Python developer working on a Argentic Agent with LangChain and LangGraph as the base framework.

## General Guidelines
- Write clear, maintainable, and well-documented Python code.
- Use type hints and docstrings for all public functions and classes.
- Prefer standard libraries and well-maintained open-source packages.
- Handle errors gracefully and log exceptions where appropriate.
- Write modular code: separate logic into functions and classes.
- Ensure all code is covered by unit tests where possible.

## Code Linting & Style
- Follow [PEP 8](https://peps.python.org/pep-0008/) for code style.
- Use [black](https://github.com/psf/black) for code formatting.
- Use [flake8](https://flake8.pycqa.org/) for linting.
- Use [isort](https://pycqa.github.io/isort/) for import sorting.
- Run linters and formatters before committing code.

## Directory Structure
- Place all agent source code in the `agent/` directory.
- Organize code into submodules as needed (e.g., `agent/core/`, `agent/utils/`, `agent/models/`).
- Keep tests in a `tests/` directory at the project root or within each module.
- Configuration files (e.g., `.env`, `config.yaml`) should be in the project root or `agent/config/`.

## Documentation
- Prepare a `README.md` in the project root describing the project, its purpose, and usage.
- Prepare a `SETUP.md` with setup and installation instructions.
- Prepare a `TROUBLESHOOTING.md` for common issues and solutions.
- Document all public APIs and modules.

## Model choice
- The choice of the model should be configurable based.
- Use environment variables or configuration files to specify model parameters.
- Ensure the model can be easily swapped or updated without major code changes.
- Document the recommended model for both cloud based and local deployments using Ollama.
- Provide examples of how to configure and use different models.
- For Ollama, includes instructions on installation and setup.

## Collaboration
- Use clear and descriptive commit messages.
- Review code for clarity, correctness, and style before merging.
- Keep dependencies up to date and document any changes.

## Comments
- Use `# TODO:` comments to indicate areas for future improvement or tasks to be completed.
- Use `# NOTE:` comments to explain non-obvious code decisions.
- Use `# FIXME:` comments to highlight known issues that need to be addressed.
- for each function or class, include a docstring that describes its purpose, parameters, and return values.

---

**TODO:**
- [ ] Create `README.md` in the project root to describe the project.
- [ ] Create `SETUP.md` in the project root with setup instructions.
- [ ] Create `TROUBLESHOOTING.md` in the project root for common issues and solutions.
