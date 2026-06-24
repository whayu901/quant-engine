"""
Phase 2: Validation utilities for Analysis Grid System
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
import re


# Constants for validation limits
MAX_GRID_NAME_LENGTH = 100
MAX_DESCRIPTION_LENGTH = 500
MAX_CONTENT_LENGTH = 10000
MAX_MARKETS = 20
MAX_COMPARISON_DIMENSIONS = 10
MAX_EVIDENCE_PER_CELL = 100
MAX_EXPORT_SIZE = 50 * 1024 * 1024  # 50MB
MAX_THEMES_PER_PROJECT = 1000
MAX_INSIGHTS_PER_PROJECT = 5000


def validate_grid_name(name: str) -> tuple[bool, Optional[str]]:
    """Validate grid name"""
    if not name or not name.strip():
        return False, "Grid name is required"

    if len(name) > MAX_GRID_NAME_LENGTH:
        return False, f"Grid name must be {MAX_GRID_NAME_LENGTH} characters or less"

    # Check for valid characters (alphanumeric, spaces, hyphens, underscores)
    if not re.match(r'^[\w\s\-]+$', name):
        return False, "Grid name can only contain letters, numbers, spaces, hyphens, and underscores"

    return True, None


def validate_markets(markets: List[str]) -> tuple[bool, Optional[str]]:
    """Validate market list"""
    if not markets:
        return False, "At least one market is required"

    if len(markets) > MAX_MARKETS:
        return False, f"Maximum {MAX_MARKETS} markets allowed"

    # Check for duplicates
    if len(markets) != len(set(markets)):
        return False, "Duplicate markets are not allowed"

    # Validate each market name
    for market in markets:
        if not market or not market.strip():
            return False, "Empty market names are not allowed"
        if len(market) > 50:
            return False, "Market name must be 50 characters or less"

    return True, None


def validate_comparison_dimensions(dimensions: List[str]) -> tuple[bool, Optional[str]]:
    """Validate comparison dimensions"""
    if not dimensions:
        return False, "At least one comparison dimension is required"

    if len(dimensions) > MAX_COMPARISON_DIMENSIONS:
        return False, f"Maximum {MAX_COMPARISON_DIMENSIONS} comparison dimensions allowed"

    # Check for duplicates
    if len(dimensions) != len(set(dimensions)):
        return False, "Duplicate dimensions are not allowed"

    return True, None


def validate_evidence_content(content: str) -> tuple[bool, Optional[str]]:
    """Validate evidence content"""
    if not content or not content.strip():
        return False, "Evidence content is required"

    if len(content) > MAX_CONTENT_LENGTH:
        return False, f"Evidence content must be {MAX_CONTENT_LENGTH} characters or less"

    return True, None


def validate_theme_data(name: str, description: str) -> tuple[bool, Optional[str]]:
    """Validate theme data"""
    if not name or not name.strip():
        return False, "Theme name is required"

    if len(name) > 100:
        return False, "Theme name must be 100 characters or less"

    if not description or not description.strip():
        return False, "Theme description is required"

    if len(description) > MAX_DESCRIPTION_LENGTH:
        return False, f"Theme description must be {MAX_DESCRIPTION_LENGTH} characters or less"

    return True, None


def validate_insight_data(title: str, description: str, themes: List[str]) -> tuple[bool, Optional[str]]:
    """Validate insight data"""
    if not title or not title.strip():
        return False, "Insight title is required"

    if len(title) > 200:
        return False, "Insight title must be 200 characters or less"

    if not description or not description.strip():
        return False, "Insight description is required"

    if len(description) > 2000:
        return False, "Insight description must be 2000 characters or less"

    if not themes:
        return False, "At least one theme is required for insight"

    if len(themes) > 10:
        return False, "Maximum 10 themes per insight allowed"

    return True, None


def validate_report_title(title: str) -> tuple[bool, Optional[str]]:
    """Validate report title"""
    if not title or not title.strip():
        return False, "Report title is required"

    if len(title) > 200:
        return False, "Report title must be 200 characters or less"

    # Check for valid characters
    if not re.match(r'^[\w\s\-\.\,]+$', title):
        return False, "Report title contains invalid characters"

    return True, None


def validate_export_format(format: str) -> tuple[bool, Optional[str]]:
    """Validate export format"""
    valid_formats = ['docx', 'pdf', 'pptx', 'xlsx', 'json']

    if format not in valid_formats:
        return False, f"Invalid export format. Must be one of: {', '.join(valid_formats)}"

    return True, None


def sanitize_cell_content(content: str) -> str:
    """Sanitize cell content to prevent XSS"""
    # Remove any script tags
    content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.IGNORECASE | re.DOTALL)

    # Remove event handlers
    content = re.sub(r'\s*on\w+\s*=\s*["\'][^"\']*["\']', '', content, flags=re.IGNORECASE)

    # Remove javascript: URLs
    content = re.sub(r'javascript:', '', content, flags=re.IGNORECASE)

    return content.strip()


def validate_grid_config(config: Optional[Dict[str, Any]]) -> tuple[bool, Optional[str]]:
    """Validate grid configuration"""
    if not config:
        return True, None  # Config is optional

    # Check config size
    import json
    config_str = json.dumps(config)
    if len(config_str) > 10000:
        return False, "Grid configuration is too large (max 10KB)"

    # Validate specific config fields if present
    if 'columns' in config:
        if not isinstance(config['columns'], list):
            return False, "Grid columns must be a list"
        if len(config['columns']) > 50:
            return False, "Maximum 50 columns allowed"

    if 'rows' in config:
        if not isinstance(config['rows'], list):
            return False, "Grid rows must be a list"
        if len(config['rows']) > 100:
            return False, "Maximum 100 rows allowed"

    return True, None


class GridCellValidator:
    """Validator for grid cell operations"""

    @staticmethod
    def validate_cell_data(row_id: str, column_id: str, content: str,
                          evidence_ids: Optional[List[str]] = None) -> tuple[bool, Optional[str]]:
        """Validate complete cell data"""

        # Validate IDs
        if not row_id or not column_id:
            return False, "Row and column IDs are required"

        # Validate content
        if not content or not content.strip():
            return False, "Cell content is required"

        if len(content) > MAX_CONTENT_LENGTH:
            return False, f"Cell content exceeds maximum length of {MAX_CONTENT_LENGTH} characters"

        # Validate evidence IDs if provided
        if evidence_ids:
            if len(evidence_ids) > MAX_EVIDENCE_PER_CELL:
                return False, f"Maximum {MAX_EVIDENCE_PER_CELL} evidence items per cell allowed"

            # Check for duplicates
            if len(evidence_ids) != len(set(evidence_ids)):
                return False, "Duplicate evidence IDs are not allowed"

        return True, None


class ReportExportValidator:
    """Validator for report export operations"""

    @staticmethod
    def validate_export_request(report_size: int, format: str) -> tuple[bool, Optional[str]]:
        """Validate report export request"""

        # Check format
        valid, error = validate_export_format(format)
        if not valid:
            return False, error

        # Check size limits
        if report_size > MAX_EXPORT_SIZE:
            return False, f"Report too large for export (max {MAX_EXPORT_SIZE // (1024*1024)}MB)"

        return True, None


def validate_search_params(themes: Optional[List[str]] = None,
                          evidence_type: Optional[str] = None,
                          market: Optional[str] = None) -> tuple[bool, Optional[str]]:
    """Validate search parameters"""

    # Validate themes if provided
    if themes:
        if len(themes) > 20:
            return False, "Maximum 20 themes allowed in search"

        for theme in themes:
            if len(theme) > 100:
                return False, "Theme name too long in search parameters"

    # Validate evidence type
    if evidence_type:
        valid_types = ['quote', 'observation', 'insight', 'data_point', 'image', 'video']
        if evidence_type not in valid_types:
            return False, f"Invalid evidence type. Must be one of: {', '.join(valid_types)}"

    # Validate market
    if market and len(market) > 50:
        return False, "Market name must be 50 characters or less"

    return True, None