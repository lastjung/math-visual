#!/bin/bash

PORT="3000"

PORT_PID=$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -n 1)
if [ -n "$PORT_PID" ]; then
    echo "Stopping server on http://localhost:$PORT (PID: $PORT_PID)"
    kill "$PORT_PID"
    exit 0
fi

echo "Starting Python server on http://localhost:$PORT..."
exec python3 -m http.server "$PORT"
