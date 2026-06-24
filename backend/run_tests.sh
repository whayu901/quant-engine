#!/bin/bash

# Qual Engine Backend - Test Runner Script
# This script helps run tests and generate coverage reports

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_TYPE="all"
PARALLEL=false
VERBOSE=false
COVERAGE=true
MARKER=""

# Functions
print_usage() {
    echo "Usage: ./run_tests.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -t, --type TYPE         Test type: all (default), unit, integration, api, e2e"
    echo "  -m, --marker MARKER     Pytest marker (unit, integration, api, auth, db)"
    echo "  -p, --parallel          Run tests in parallel (requires pytest-xdist)"
    echo "  -v, --verbose           Verbose output"
    echo "  -c, --coverage          Generate coverage report (default)"
    echo "  --no-coverage           Skip coverage report"
    echo "  --fast                  Quick test run (no coverage, parallel)"
    echo "  --slow-tests            Include slow tests"
    echo ""
    echo "Examples:"
    echo "  ./run_tests.sh                    # Run all tests with coverage"
    echo "  ./run_tests.sh --fast             # Fast test run"
    echo "  ./run_tests.sh -m unit            # Run only unit tests"
    echo "  ./run_tests.sh -m integration -p  # Integration tests in parallel"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            print_usage
            exit 0
            ;;
        -t|--type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -m|--marker)
            MARKER="$2"
            shift 2
            ;;
        -p|--parallel)
            PARALLEL=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        --no-coverage)
            COVERAGE=false
            shift
            ;;
        --fast)
            PARALLEL=true
            COVERAGE=false
            shift
            ;;
        --slow-tests)
            # Don't exclude slow tests
            MARKER="${MARKER} and not slow"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Print header
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Qual Engine Backend - Test Runner${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Build pytest command
PYTEST_CMD="pytest tests/"

# Add test type filter
case $TEST_TYPE in
    unit)
        PYTEST_CMD="$PYTEST_CMD -m unit"
        echo -e "${YELLOW}Running unit tests...${NC}"
        ;;
    integration)
        PYTEST_CMD="$PYTEST_CMD -m integration"
        echo -e "${YELLOW}Running integration tests...${NC}"
        ;;
    api)
        PYTEST_CMD="$PYTEST_CMD -m api"
        echo -e "${YELLOW}Running API tests...${NC}"
        ;;
    e2e)
        PYTEST_CMD="$PYTEST_CMD -m e2e"
        echo -e "${YELLOW}Running end-to-end tests...${NC}"
        ;;
    all)
        echo -e "${YELLOW}Running all tests...${NC}"
        ;;
    *)
        echo -e "${RED}Unknown test type: $TEST_TYPE${NC}"
        exit 1
        ;;
esac

# Add marker filter
if [ ! -z "$MARKER" ]; then
    PYTEST_CMD="$PYTEST_CMD -m $MARKER"
fi

# Add parallel execution
if [ "$PARALLEL" = true ]; then
    PYTEST_CMD="$PYTEST_CMD -n auto"
fi

# Add verbose output
if [ "$VERBOSE" = true ]; then
    PYTEST_CMD="$PYTEST_CMD -v -s"
else
    PYTEST_CMD="$PYTEST_CMD -v"
fi

# Add coverage
if [ "$COVERAGE" = true ]; then
    PYTEST_CMD="$PYTEST_CMD --cov=app --cov-report=html --cov-report=term"
fi

# Exclude slow tests by default (unless --slow-tests specified)
if [[ ! "$*" =~ "--slow-tests" ]]; then
    PYTEST_CMD="$PYTEST_CMD -m 'not slow'"
fi

echo ""
echo -e "${BLUE}Command: $PYTEST_CMD${NC}"
echo ""

# Run tests
if eval "$PYTEST_CMD"; then
    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}Tests passed!${NC}"
    echo -e "${GREEN}================================================${NC}"

    # Show coverage report
    if [ "$COVERAGE" = true ]; then
        echo ""
        echo -e "${YELLOW}Coverage report generated: htmlcov/index.html${NC}"
    fi

    exit 0
else
    echo ""
    echo -e "${RED}================================================${NC}"
    echo -e "${RED}Tests failed!${NC}"
    echo -e "${RED}================================================${NC}"
    exit 1
fi
