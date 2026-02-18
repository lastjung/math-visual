#!/bin/bash

PORT="3000"

# 포그라운드 실행: Ctrl+C로 즉시 종료됨
PORT_PID=$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -n 1)
if [ -n "$PORT_PID" ]; then
    echo "Port $PORT is already in use (PID: $PORT_PID)."
    exit 1
fi

echo "Starting Server on http://localhost:$PORT..."
exec npx serve -l "$PORT" .
