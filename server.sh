#!/bin/bash

# 1. 경로 설정 (범용 표준)
PID_DIR="node_modules/.cache"
PID_FILE="$PID_DIR/dev-server.pid"

# 2. 실행 중인 서버 종료 함수
stop_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 $PID 2>/dev/null; then
            echo "Stopping Server (PID: $PID)..."
            kill $PID
            rm "$PID_FILE"
            echo "Server stopped."
            return 0
        fi
        rm "$PID_FILE"
    fi
}

# 3. 메인 로직: 이미 실행 중이면 종료(Toggle)
if [ -f "$PID_FILE" ]; then
    stop_server
    # Toggle 기능: 명시적으로 끄고 싶을 때 중복 실행하면 꺼짐
    exit 0
fi

# 4. 서버 시작 및 클린업 설정
mkdir -p "$PID_DIR"
echo "Starting Server on http://localhost:3000..."

# npx serve를 백그라운드에서 실행하고 PID 저장
# stdout과 stderr를 로그 파일로 리다이렉션 (옵션)
npx serve -l 3000 . > "$PID_DIR/server.log" 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"

echo "Server started with PID: $SERVER_PID"
echo "Log file: $PID_DIR/server.log"
