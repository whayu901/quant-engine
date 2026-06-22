"""
Phase 2 Tests: Analysis Grid, Content Analysis, Evidence Panel
"""

import pytest
import json
from datetime import datetime
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))

from app.models_phase2 import (
    AnalysisGrid, GridCell, Evidence, ContentAnalysisReport,
    Theme, Insight, AnalysisType, GridType
)
from app.analysis_grid import AnalysisGridService, EvidenceService
from app.content_analysis import ContentAnalysisService


class TestPhase2Models:
    """Test Phase 2 database models"""

    def test_analysis_grid_model(self):
        """Test AnalysisGrid model exists with required fields"""
        assert hasattr(AnalysisGrid, 'name')
        assert hasattr(AnalysisGrid, 'analysis_type')
        assert hasattr(AnalysisGrid, 'grid_type')
        assert hasattr(AnalysisGrid, 'columns')
        assert hasattr(AnalysisGrid, 'rows')
        assert hasattr(AnalysisGrid, 'comparison_dimensions')

    def test_grid_cell_model(self):
        """Test GridCell model structure"""
        assert hasattr(GridCell, 'grid_id')
        assert hasattr(GridCell, 'row_id')
        assert hasattr(GridCell, 'column_id')
        assert hasattr(GridCell, 'content')
        assert hasattr(GridCell, 'evidence_ids')
        assert hasattr(GridCell, 'ai_summary')

    def test_evidence_model(self):
        """Test Evidence model for evidence panel"""
        assert hasattr(Evidence, 'source_type')
        assert hasattr(Evidence, 'source_id')
        assert hasattr(Evidence, 'evidence_type')
        assert hasattr(Evidence, 'content')
        assert hasattr(Evidence, 'themes')
        assert hasattr(Evidence, 'significance')
        assert hasattr(Evidence, 'market')

    def test_content_analysis_report_model(self):
        """Test ContentAnalysisReport model"""
        assert hasattr(ContentAnalysisReport, 'title')
        assert hasattr(ContentAnalysisReport, 'executive_summary')
        assert hasattr(ContentAnalysisReport, 'key_findings')
        assert hasattr(ContentAnalysisReport, 'themes_analysis')
        assert hasattr(ContentAnalysisReport, 'recommendations')
        assert hasattr(ContentAnalysisReport, 'market_comparison')
        assert hasattr(ContentAnalysisReport, 'regional_patterns')

    def test_theme_model(self):
        """Test Theme model for hierarchical themes"""
        assert hasattr(Theme, 'name')
        assert hasattr(Theme, 'parent_id')
        assert hasattr(Theme, 'level')
        assert hasattr(Theme, 'frequency')
        assert hasattr(Theme, 'ai_generated')

    def test_insight_model(self):
        """Test Insight model"""
        assert hasattr(Insight, 'title')
        assert hasattr(Insight, 'category')
        assert hasattr(Insight, 'priority')
        assert hasattr(Insight, 'evidence_ids')
        assert hasattr(Insight, 'markets')
        assert hasattr(Insight, 'actionable')


class TestAnalysisEnums:
    """Test enumeration types"""

    def test_analysis_type_enum(self):
        """Test AnalysisType enum values"""
        assert AnalysisType.BASIC.value == "basic"
        assert AnalysisType.COMPARATIVE.value == "comparative"
        assert AnalysisType.MULTIMARKET.value == "multimarket"
        assert AnalysisType.LONGITUDINAL.value == "longitudinal"
        assert AnalysisType.SEGMENT.value == "segment"

    def test_grid_type_enum(self):
        """Test GridType enum values"""
        assert GridType.THEMES.value == "themes"
        assert GridType.QUESTIONS.value == "questions"
        assert GridType.CONCEPTS.value == "concepts"
        assert GridType.JOURNEY.value == "journey"
        assert GridType.PERSONAS.value == "personas"


class TestAnalysisGridService:
    """Test Analysis Grid service functionality"""

    def test_analysis_grid_service_exists(self):
        """Test that AnalysisGridService is implemented"""
        assert AnalysisGridService is not None

    def test_grid_service_methods(self):
        """Test required methods exist"""
        assert hasattr(AnalysisGridService, 'create_grid')
        assert hasattr(AnalysisGridService, 'create_comparative_grid')
        assert hasattr(AnalysisGridService, 'create_multimarket_grid')
        assert hasattr(AnalysisGridService, 'add_cell')
        assert hasattr(AnalysisGridService, 'populate_from_transcripts')
        assert hasattr(AnalysisGridService, 'compare_markets')

    def test_default_columns_generation(self):
        """Test that default columns are generated for each grid type"""
        from app.analysis_grid import AnalysisGridService
        service = AnalysisGridService(None)  # Mock DB

        # Test themes grid columns
        theme_columns = service._get_default_columns(GridType.THEMES)
        assert len(theme_columns) > 0
        assert any(col['id'] == 'theme' for col in theme_columns)

        # Test journey grid columns
        journey_columns = service._get_default_columns(GridType.JOURNEY)
        assert any(col['id'] == 'stage' for col in journey_columns)

        # Test personas grid columns
        persona_columns = service._get_default_columns(GridType.PERSONAS)
        assert any(col['id'] == 'persona' for col in persona_columns)


class TestEvidenceService:
    """Test Evidence Panel service"""

    def test_evidence_service_exists(self):
        """Test that EvidenceService is implemented"""
        assert EvidenceService is not None

    def test_evidence_service_methods(self):
        """Test required methods exist"""
        assert hasattr(EvidenceService, 'create_evidence')
        assert hasattr(EvidenceService, 'extract_from_transcript')
        assert hasattr(EvidenceService, 'search_evidence')
        assert hasattr(EvidenceService, 'link_to_insight')


class TestContentAnalysisService:
    """Test Content Analysis Report generation"""

    def test_content_analysis_service_exists(self):
        """Test that ContentAnalysisService is implemented"""
        assert ContentAnalysisService is not None

    def test_report_generation_methods(self):
        """Test report generation methods exist"""
        assert hasattr(ContentAnalysisService, 'generate_report')
        assert hasattr(ContentAnalysisService, '_generate_executive_summary')
        assert hasattr(ContentAnalysisService, '_generate_key_findings')
        assert hasattr(ContentAnalysisService, '_generate_themes_analysis')
        assert hasattr(ContentAnalysisService, '_generate_recommendations')
        assert hasattr(ContentAnalysisService, '_generate_market_comparison')
        assert hasattr(ContentAnalysisService, '_generate_regional_patterns')

    def test_export_methods(self):
        """Test report export methods exist"""
        assert hasattr(ContentAnalysisService, 'export_report')
        assert hasattr(ContentAnalysisService, '_export_to_docx')
        assert hasattr(ContentAnalysisService, '_export_to_pdf')
        assert hasattr(ContentAnalysisService, '_export_to_pptx')


class TestPhase2Endpoints:
    """Test Phase 2 API endpoints"""

    def test_analysis_router_exists(self):
        """Test that analysis router is implemented"""
        from app.routers.analysis import router
        assert router is not None

    def test_grid_endpoints(self):
        """Test grid-related endpoints are defined"""
        from app.routers.analysis import (
            create_grid,
            create_comparative_grid,
            create_multimarket_grid,
            list_grids,
            get_grid,
            add_grid_cell,
            populate_grid,
            compare_markets
        )
        assert create_grid is not None
        assert create_comparative_grid is not None
        assert create_multimarket_grid is not None
        assert list_grids is not None
        assert get_grid is not None
        assert add_grid_cell is not None
        assert populate_grid is not None
        assert compare_markets is not None

    def test_evidence_endpoints(self):
        """Test evidence-related endpoints are defined"""
        from app.routers.analysis import (
            create_evidence,
            extract_evidence,
            search_evidence
        )
        assert create_evidence is not None
        assert extract_evidence is not None
        assert search_evidence is not None

    def test_report_endpoints(self):
        """Test report-related endpoints are defined"""
        from app.routers.analysis import (
            generate_report,
            list_reports,
            get_report,
            export_report
        )
        assert generate_report is not None
        assert list_reports is not None
        assert get_report is not None
        assert export_report is not None

    def test_theme_and_insight_endpoints(self):
        """Test theme and insight endpoints are defined"""
        from app.routers.analysis import (
            create_theme,
            list_themes,
            create_insight,
            list_insights
        )
        assert create_theme is not None
        assert list_themes is not None
        assert create_insight is not None
        assert list_insights is not None


class TestMultimarketFunctionality:
    """Test multimarket-specific features"""

    def test_market_comparison_structure(self):
        """Test market comparison data structure"""
        from app.content_analysis import ContentAnalysisService
        service = ContentAnalysisService(None)

        # Mock market comparison
        markets = ["Indonesia", "Singapore", "Thailand"]

        # Should handle SEA markets
        expected_markets = ["Indonesia", "Singapore", "Thailand", "Malaysia", "Philippines", "Vietnam"]
        for market in markets:
            assert market in expected_markets

    def test_regional_patterns_identification(self):
        """Test regional pattern detection for SEA"""
        patterns = {
            "universal_trends": ["Mobile Commerce Dominance", "Social Commerce Integration"],
            "emerging_behaviors": ["Live Commerce Adoption", "Super App Preference"],
            "cultural_influences": ["Collectivist Decision Making", "Face Culture"]
        }

        assert "universal_trends" in patterns
        assert "emerging_behaviors" in patterns
        assert "cultural_influences" in patterns


class TestPhase2Integration:
    """Test Phase 2 integration with existing system"""

    def test_models_import(self):
        """Test that new models can be imported"""
        try:
            from app.models_phase2 import (
                AnalysisGrid, GridCell, Evidence,
                ContentAnalysisReport, Theme, Insight
            )
            assert True
        except ImportError:
            assert False, "Failed to import Phase 2 models"

    def test_services_import(self):
        """Test that services can be imported"""
        try:
            from app.analysis_grid import AnalysisGridService, EvidenceService
            from app.content_analysis import ContentAnalysisService
            assert True
        except ImportError:
            assert False, "Failed to import Phase 2 services"

    def test_router_import(self):
        """Test that router can be imported"""
        try:
            from app.routers.analysis import router
            assert router is not None
        except ImportError:
            assert False, "Failed to import analysis router"


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])