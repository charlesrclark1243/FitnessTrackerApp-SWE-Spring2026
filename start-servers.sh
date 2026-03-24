#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Fitness Tracker - Starting Servers${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check for Go installation
if ! command -v go &> /dev/null; then
    echo -e "${RED}Error: Go is not installed or not in PATH${NC}"
    echo -e "${BLUE}Please install Go from https://golang.org/dl/${NC}"
    exit 1
fi

# Check for Node/npm installation
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed or not in PATH${NC}"
    echo -e "${BLUE}Please install Node.js from https://nodejs.org/${NC}"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}Error: backend directory not found${NC}"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "forntend/FitnessTrackerApp-SWE-Spring2026-forntend" ]; then
    echo -e "${RED}Error: frontend directory not found${NC}"
    exit 1
fi

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo -e "${BLUE}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${GREEN}Starting Go backend on http://localhost:8080...${NC}"
cd "$SCRIPT_DIR/backend"
go run main.go > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
cd "$SCRIPT_DIR"

# Wait for backend to start
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}Failed to start backend. Check backend.log for errors${NC}"
    exit 1
fi

echo -e "${GREEN}Backend started successfully (PID: $BACKEND_PID)${NC}"
echo ""

# Start frontend
echo -e "${GREEN}Starting Angular frontend on http://localhost:4200...${NC}"
cd "$SCRIPT_DIR/forntend/FitnessTrackerApp-SWE-Spring2026-forntend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing npm packages (first time only)...${NC}"
    npm install
fi

npm start > "$SCRIPT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
cd "$SCRIPT_DIR"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Both servers are running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Backend:${NC}  http://localhost:8080"
echo -e "${BLUE}Frontend:${NC} http://localhost:4200"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  Backend:  tail -f backend.log"
echo -e "  Frontend: tail -f frontend.log"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
