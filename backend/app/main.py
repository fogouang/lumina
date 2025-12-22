"""
Point d'entrée FastAPI - TCF Canada Platform
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.config import get_settings
from app.shared.database.session import check_db_connection, close_db
from app.shared.exceptions.base import AppException
from app.shared.logging import logger, setup_logging
from app.shared.schemas.responses import ErrorResponse

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle events (startup/shutdown).
    """
    # 🔥 STARTUP
    logger.info("=" * 60)
    logger.info("🚀 Starting TCF Canada Platform API")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info("=" * 60)
    
    # Setup logging
    setup_logging()
    logger.info("✅ Logging configured")
    
    # Check database connection
    logger.info("📊 Checking database connection...")
    try:
        if await check_db_connection():
            logger.info("✅ Database connection successful")
        else:
            logger.error("❌ Database connection failed")
            raise Exception("Cannot connect to database")
    except Exception as e:
        logger.error(f"❌ Database check failed: {e}", exc_info=True)
        raise
    
    logger.info("🎉 Application startup complete")
    logger.info("=" * 60)
    
    yield  # Application running
    
    # 🔥 SHUTDOWN
    logger.info("=" * 60)
    logger.info("👋 Shutting down TCF Canada Platform API")
    
    # Close database connections
    await close_db()
    logger.info("✅ Database connections closed")
    
    logger.info("=" * 60)


# Créer app FastAPI avec lifespan
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)


# ✅ CORS Configuration
if settings.DEBUG:
    # Development: Allow localhost
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["Set-Cookie"],
    )
    logger.info(f"🌐 CORS enabled for: {settings.BACKEND_CORS_ORIGINS}")
else:
    # Production: Strict origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
        allow_headers=["*"],
        expose_headers=["Set-Cookie"],
    )


# ✅ Exception Handlers

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """
    Handler pour exceptions custom de l'app.
    """
    logger.error(
        f"AppException: {exc.code} - {exc.message}",
        extra={"details": exc.details, "path": request.url.path}
    )
    
    return JSONResponse(
        status_code=400,
        content=ErrorResponse(
            message=exc.message,
            code=exc.code,
            details=exc.details
        ).model_dump()
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handler pour erreurs de validation Pydantic.
    """
    errors = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        errors[field] = error["msg"]
    
    logger.warning(
        f"Validation error on {request.url.path}",
        extra={"errors": errors}
    )
    
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            message="Erreur de validation",
            code="VALIDATION_ERROR",
            details=errors
        ).model_dump()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """
    Handler pour toutes les autres exceptions non gérées.
    """
    logger.error(
        f"Unhandled exception: {type(exc).__name__}",
        exc_info=True,
        extra={"path": request.url.path}
    )
    
    # En production, ne pas exposer les détails
    detail = str(exc) if settings.DEBUG else "Une erreur interne est survenue"
    
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            message=detail,
            code="INTERNAL_SERVER_ERROR"
        ).model_dump()
    )


# ✅ Inclure router API
app.include_router(api_router, prefix="/api/v1")
logger.info("API routes mounted at /api/v1")


# ✅ Health Check Endpoints

@app.get("/")
async def root():
    """
    Health check root.
    """
    logger.debug("Root endpoint called")
    return {
        "message": "TCF Canada Platform API",
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health():
    """
    Health check endpoint.
    """
    logger.debug("Health check endpoint called")
    
    # Vérifier DB
    db_healthy = await check_db_connection()
    
    return {
        "status": "healthy" if db_healthy else "unhealthy",
        "database": "connected" if db_healthy else "disconnected"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )