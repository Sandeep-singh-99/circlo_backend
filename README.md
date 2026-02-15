# Circlo Backend

A multi-service backend application with FastAPI (Python) and Node.js services orchestrated using Docker Compose.

## Project Structure

```
circlo_backend/
├── docker-compose.yml          # Docker Compose configuration
├── README.md                    # This file
├── fastapi-service/
│   ├── Dockerfile              # FastAPI service container
│   ├── requirements.txt         # Python dependencies
│   └── app/
│       ├── __init__.py
│       └── main.py             # FastAPI application entry point
└── nodejs-service/
    ├── Dockerfile              # Node.js service container
    ├── package.json            # Node.js dependencies
    └── server.js               # Node.js server entry point
```

## Services

### FastAPI Service
- Python-based REST API service
- Port: 8000 (configurable)
- Dependencies defined in `fastapi-service/requirements.txt`

### Node.js Service
- JavaScript-based service
- Port: 3000 (configurable)
- Dependencies defined in `nodejs-service/package.json`

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### Running with Docker Compose

1. Start all services:
```bash
docker-compose up
```

2. View logs from all services:
```bash
docker-compose logs -f
```

3. Stop all services:
```bash
docker-compose down
```

### Local Development

#### FastAPI Service
```bash
cd fastapi-service
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

#### Node.js Service
```bash
cd nodejs-service
npm install
npm start
```

## Configuration

Environment-specific configurations can be added to `.env` files or passed as environment variables to Docker Compose.

## Contributing

Ensure dependencies are properly documented in:
- `fastapi-service/requirements.txt` for Python packages
- `nodejs-service/package.json` for Node.js packages
