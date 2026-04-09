"""
Security logging configuration for team leader management (Vercel-compatible)
"""
import logging
import os
from datetime import datetime
from django.conf import settings


def setup_security_logging():
    """Setup secure logging for team leader operations (Vercel-compatible)"""
    
    # Only try to create logs directory in development
    if settings.DEBUG:
        # Create logs directory if it doesn't exist (local development only)
        log_dir = os.path.join(settings.BASE_DIR, 'logs')
        os.makedirs(log_dir, exist_ok=True)
        
        # Configure security logger with file handler
        security_logger = logging.getLogger('security')
        security_logger.setLevel(logging.INFO)
        
        # Remove existing handlers to avoid duplicates
        security_logger.handlers.clear()
        
        # Create file handler for security logs
        log_filename = f"security_{datetime.now().strftime('%Y_%m')}.log"
        log_path = os.path.join(log_dir, log_filename)
        
        file_handler = logging.FileHandler(log_path)
        file_handler.setLevel(logging.INFO)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(formatter)
        
        # Add handler to logger
        security_logger.addHandler(file_handler)
        security_logger.propagate = False  # Don't propagate to root logger
    else:
        # Production (Vercel) - console logging only
        security_logger = logging.getLogger('security')
        security_logger.setLevel(logging.INFO)
        
        # Use the console handler already configured in settings
        # No additional setup needed for Vercel
    
    return security_logger


def log_team_leader_event(event_type, email, team_name, ip_address, details=""):
    """Log team leader related security events (Vercel-compatible)"""
    security_logger = logging.getLogger('security')
    
    # Add prefix for easier filtering in Vercel logs
    prefix = "[TEAM_LEADER]" if not settings.DEBUG else "TEAM_LEADER"
    message = f"{prefix}_{event_type.upper()}: Email={email} | Team={team_name} | IP={ip_address}"
    if details:
        message += f" | Details={details}"
    
    if event_type.upper() in ['ERROR', 'DENIED', 'SECURITY_VIOLATION']:
        security_logger.error(message)
    elif event_type.upper() in ['WARNING', 'SUSPICIOUS']:
        security_logger.warning(message)
    else:
        security_logger.info(message)


def get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


# Initialize security logging when module is imported (Vercel-compatible)
try:
    setup_security_logging()
except Exception as e:
    # Fallback to console logging if file system is read-only
    import logging
    logging.getLogger('security').warning(f"Security logging setup failed (using console fallback): {e}")