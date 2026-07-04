#!/bin/bash
# Start The Studio and open it in the browser.
cd "$(dirname "$0")"
(sleep 1 && open http://127.0.0.1:8786) &
exec python3 app.py
