#!/bin/bash

# WhatsApp SaaS - Project Initialization Script
# This script automates the initial setup of the project

set -e

echo "🚀 WhatsApp SaaS Platform - Initialization Script"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git installed${NC}"

echo ""
echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install server dependencies
echo "  Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "  Installing client dependencies..."
cd client
npm install
cd ..

echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo "⚙️  Setting up environment variables..."

# Create .env files if they don't exist
if [ ! -f server/.env ]; then
    cp server/.env.example server/.env
    echo -e "${YELLOW}Created server/.env - Please fill in your credentials${NC}"
else
    echo -e "${GREEN}✓ server/.env already exists${NC}"
fi

if [ ! -f client/.env.example ]; then
    echo "VITE_API_URL=http://localhost:5000" > client/.env.example
fi

if [ ! -f client/.env ]; then
    cp client/.env.example client/.env
    echo -e "${YELLOW}Created client/.env${NC}"
else
    echo -e "${GREEN}✓ client/.env already exists${NC}"
fi

echo ""
echo "🐳 Docker Setup (Optional)"
echo ""
read -p "Do you want to set up Docker Compose? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗ Docker not found. Please install Docker Desktop${NC}"
    else
        echo -e "${GREEN}✓ Docker detected${NC}"
        echo "Run: docker-compose up --build"
    fi
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Edit server/.env with your API credentials"
echo "2. Edit client/.env if needed"
echo "3. For local development:"
echo "   - Terminal 1: cd server && npm run dev"
echo "   - Terminal 2: cd client && npm run dev"
echo ""
echo "4. For Docker development:"
echo "   docker-compose up --build"
echo ""
echo "📚 Documentation:"
echo "   - Main README: ./README.md"
echo "   - Setup Guide: ./SETUP.md"
echo ""
echo "Visit http://localhost:3000 once services are running"
echo ""
