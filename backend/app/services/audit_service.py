"""
Audit Logging Service
Comprehensive audit trail for enterprise compliance
"""

import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from fastapi import Request

from ..models_enterprise import AuditLog
from ..models import User, _uid
from ..config import settings

logger = logging.getLogger(__name__)


class AuditService:
    """Service for comprehensive audit logging"""

    @staticmethod
    def get_client_ip(request: Request) -> str:
        """Extract client IP from request headers"""
        # Check for proxy headers
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # Fallback to direct client
        if request.client:
            return request.client.host

        return "unknown"

    @staticmethod
    def get_country_from_ip(ip_address: str) -> tuple[str, str]:
        """Get country and region from IP address"""
        # In production, use GeoIP2 or similar service
        # For now, return defaults based on common SEA IP ranges

        # Simple mock for development
        if ip_address.startswith("103."):
            return "SG", "Singapore"
        elif ip_address.startswith("202."):
            return "ID", "Jakarta"
        elif ip_address.startswith("203."):
            return "MY", "Kuala Lumpur"
        elif ip_address.startswith("58."):
            return "TH", "Bangkok"
        elif ip_address.startswith("120."):
            return "PH", "Manila"
        elif ip_address.startswith("113."):
            return "VN", "Ho Chi Minh City"

        return "XX", "Unknown"

    @staticmethod
    def sanitize_sensitive_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """Remove sensitive information from audit data"""
        if not data:
            return {}

        sensitive_fields = [
            "password", "token", "secret", "key", "credential",
            "card_number", "cvv", "ssn", "nric", "passport"
        ]

        sanitized = {}
        for key, value in data.items():
            # Check if field name contains sensitive keywords
            is_sensitive = any(s in key.lower() for s in sensitive_fields)

            if is_sensitive:
                sanitized[key] = "***REDACTED***"
            elif isinstance(value, dict):
                # Recursively sanitize nested dictionaries
                sanitized[key] = AuditService.sanitize_sensitive_data(value)
            elif isinstance(value, list) and value and isinstance(value[0], dict):
                # Sanitize lists of dictionaries
                sanitized[key] = [AuditService.sanitize_sensitive_data(item) for item in value]
            else:
                sanitized[key] = value

        return sanitized

    @staticmethod
    def classify_data(entity_type: str, data: Dict[str, Any]) -> tuple[str, bool, bool]:
        """Classify data sensitivity and compliance relevance"""
        # Data classification levels
        classification = "public"
        contains_pii = False
        gdpr_relevant = False

        # Check entity type
        if entity_type in ["user", "participant", "respondent"]:
            classification = "confidential"
            contains_pii = True
            gdpr_relevant = True
        elif entity_type in ["transcript", "analysis", "insight"]:
            classification = "internal"
            # Check for PII in content
            if data:
                content = json.dumps(data).lower()
                pii_indicators = ["email", "phone", "address", "birth", "identity"]
                if any(indicator in content for indicator in pii_indicators):
                    contains_pii = True
                    gdpr_relevant = True
        elif entity_type in ["project", "org"]:
            classification = "internal"

        return classification, contains_pii, gdpr_relevant

    @classmethod
    async def log_action(
        cls,
        db: Session,
        user: User,
        action: str,
        entity_type: str,
        entity_id: Optional[str] = None,
        entity_name: Optional[str] = None,
        request: Optional[Request] = None,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        response_status: Optional[int] = None,
        response_time_ms: Optional[float] = None,
        error_message: Optional[str] = None
    ) -> AuditLog:
        """Create an audit log entry"""

        # Extract request details
        ip_address = None
        user_agent = None
        request_method = None
        request_path = None
        request_params = None
        request_body = None

        if request:
            ip_address = cls.get_client_ip(request)
            user_agent = request.headers.get("User-Agent", "")[:500]
            request_method = request.method
            request_path = str(request.url.path)

            # Get query parameters
            if request.query_params:
                request_params = dict(request.query_params)
                request_params = cls.sanitize_sensitive_data(request_params)

            # Get body for POST/PUT/PATCH
            if request_method in ["POST", "PUT", "PATCH"] and hasattr(request, "_body"):
                try:
                    body = json.loads(request._body)
                    request_body = cls.sanitize_sensitive_data(body)
                except:
                    pass

        # Get geographic info
        country_code, region = cls.get_country_from_ip(ip_address) if ip_address else ("XX", "Unknown")

        # Classify data
        classification, contains_pii, gdpr_relevant = cls.classify_data(
            entity_type,
            new_values or old_values or {}
        )

        # Sanitize old and new values
        if old_values:
            old_values = cls.sanitize_sensitive_data(old_values)
        if new_values:
            new_values = cls.sanitize_sensitive_data(new_values)

        # Create audit log entry
        audit_log = AuditLog(
            id=_uid(),
            org_id=user.org_id,
            user_id=user.id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            entity_name=entity_name,
            ip_address=ip_address,
            user_agent=user_agent,
            request_method=request_method,
            request_path=request_path,
            request_params=request_params,
            request_body=request_body,
            response_status=response_status,
            response_time_ms=response_time_ms,
            error_message=error_message,
            old_values=old_values,
            new_values=new_values,
            data_classification=classification,
            contains_pii=contains_pii,
            gdpr_relevant=gdpr_relevant,
            country_code=country_code,
            region=region
        )

        db.add(audit_log)

        # Log critical actions
        if action in ["delete", "export", "share"]:
            logger.info(
                f"AUDIT: User {user.email} performed {action} on {entity_type} {entity_id} "
                f"from {ip_address} ({country_code})"
            )

        return audit_log

    @classmethod
    def query_logs(
        cls,
        db: Session,
        org_id: str,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        ip_address: Optional[str] = None,
        contains_pii: Optional[bool] = None,
        limit: int = 100,
        offset: int = 0
    ) -> tuple[List[AuditLog], int]:
        """Query audit logs with filters"""

        query = db.query(AuditLog).filter(AuditLog.org_id == org_id)

        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if action:
            query = query.filter(AuditLog.action == action)
        if entity_type:
            query = query.filter(AuditLog.entity_type == entity_type)
        if entity_id:
            query = query.filter(AuditLog.entity_id == entity_id)
        if date_from:
            query = query.filter(AuditLog.created_at >= date_from)
        if date_to:
            query = query.filter(AuditLog.created_at <= date_to)
        if ip_address:
            query = query.filter(AuditLog.ip_address == ip_address)
        if contains_pii is not None:
            query = query.filter(AuditLog.contains_pii == contains_pii)

        # Get total count
        total = query.count()

        # Get paginated results
        logs = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()

        return logs, total

    @classmethod
    def get_user_activity_summary(
        cls,
        db: Session,
        org_id: str,
        user_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get summary of user activity"""

        date_from = datetime.utcnow() - timedelta(days=days)

        # Get action counts
        action_counts = db.query(
            AuditLog.action,
            func.count(AuditLog.id).label("count")
        ).filter(
            AuditLog.org_id == org_id,
            AuditLog.user_id == user_id,
            AuditLog.created_at >= date_from
        ).group_by(AuditLog.action).all()

        # Get entity type counts
        entity_counts = db.query(
            AuditLog.entity_type,
            func.count(AuditLog.id).label("count")
        ).filter(
            AuditLog.org_id == org_id,
            AuditLog.user_id == user_id,
            AuditLog.created_at >= date_from
        ).group_by(AuditLog.entity_type).all()

        # Get unique IPs
        unique_ips = db.query(func.count(func.distinct(AuditLog.ip_address))).filter(
            AuditLog.org_id == org_id,
            AuditLog.user_id == user_id,
            AuditLog.created_at >= date_from
        ).scalar()

        # Get country distribution
        country_dist = db.query(
            AuditLog.country_code,
            func.count(AuditLog.id).label("count")
        ).filter(
            AuditLog.org_id == org_id,
            AuditLog.user_id == user_id,
            AuditLog.created_at >= date_from
        ).group_by(AuditLog.country_code).all()

        return {
            "period_days": days,
            "action_counts": {action: count for action, count in action_counts},
            "entity_counts": {entity: count for entity, count in entity_counts},
            "unique_ip_addresses": unique_ips,
            "country_distribution": {country: count for country, count in country_dist},
            "total_actions": sum(count for _, count in action_counts)
        }

    @classmethod
    def get_compliance_report(
        cls,
        db: Session,
        org_id: str,
        date_from: datetime,
        date_to: datetime
    ) -> Dict[str, Any]:
        """Generate compliance report for auditors"""

        # Get GDPR-relevant activities
        gdpr_activities = db.query(func.count(AuditLog.id)).filter(
            AuditLog.org_id == org_id,
            AuditLog.gdpr_relevant == True,
            AuditLog.created_at.between(date_from, date_to)
        ).scalar()

        # Get PII access logs
        pii_access = db.query(func.count(AuditLog.id)).filter(
            AuditLog.org_id == org_id,
            AuditLog.contains_pii == True,
            AuditLog.action.in_(["read", "export"]),
            AuditLog.created_at.between(date_from, date_to)
        ).scalar()

        # Get data exports
        exports = db.query(func.count(AuditLog.id)).filter(
            AuditLog.org_id == org_id,
            AuditLog.action == "export",
            AuditLog.created_at.between(date_from, date_to)
        ).scalar()

        # Get data deletions
        deletions = db.query(func.count(AuditLog.id)).filter(
            AuditLog.org_id == org_id,
            AuditLog.action == "delete",
            AuditLog.created_at.between(date_from, date_to)
        ).scalar()

        # Get unique users
        unique_users = db.query(func.count(func.distinct(AuditLog.user_id))).filter(
            AuditLog.org_id == org_id,
            AuditLog.created_at.between(date_from, date_to)
        ).scalar()

        # Get failed actions
        failures = db.query(func.count(AuditLog.id)).filter(
            AuditLog.org_id == org_id,
            AuditLog.error_message.isnot(None),
            AuditLog.created_at.between(date_from, date_to)
        ).scalar()

        # Get geographic distribution
        geo_dist = db.query(
            AuditLog.country_code,
            func.count(func.distinct(AuditLog.user_id)).label("users"),
            func.count(AuditLog.id).label("actions")
        ).filter(
            AuditLog.org_id == org_id,
            AuditLog.created_at.between(date_from, date_to)
        ).group_by(AuditLog.country_code).all()

        return {
            "report_period": {
                "from": date_from.isoformat(),
                "to": date_to.isoformat()
            },
            "gdpr_summary": {
                "relevant_activities": gdpr_activities,
                "pii_access_count": pii_access,
                "data_exports": exports,
                "data_deletions": deletions
            },
            "activity_summary": {
                "unique_users": unique_users,
                "failed_actions": failures,
                "total_actions": db.query(func.count(AuditLog.id)).filter(
                    AuditLog.org_id == org_id,
                    AuditLog.created_at.between(date_from, date_to)
                ).scalar()
            },
            "geographic_distribution": [
                {
                    "country": country,
                    "unique_users": users,
                    "total_actions": actions
                }
                for country, users, actions in geo_dist
            ]
        }

    @classmethod
    def cleanup_old_logs(cls, db: Session, retention_days: int = 365) -> int:
        """Clean up old audit logs based on retention policy"""

        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)

        # Count logs to be deleted
        count = db.query(func.count(AuditLog.id)).filter(
            AuditLog.created_at < cutoff_date
        ).scalar()

        # Delete old logs
        db.query(AuditLog).filter(
            AuditLog.created_at < cutoff_date
        ).delete()

        db.commit()

        logger.info(f"Cleaned up {count} audit logs older than {retention_days} days")

        return count