#!/usr/bin/env python
"""Entry point script for the Proxmox Agent."""

import asyncio
import sys
import os

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from agent.main import main

if __name__ == "__main__":
    asyncio.run(main())