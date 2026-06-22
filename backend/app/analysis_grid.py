"""
Phase 2: Analysis Grid Service
Handles creation and management of analysis grids
"""

import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from .models_phase2 import (
    AnalysisGrid, GridCell, Evidence, Theme,
    AnalysisType, GridType, Insight
)
from .models import Project, Transcript, TranscriptSegment
from .models import _uid


class AnalysisGridService:
    """Service for managing analysis grids"""

    def __init__(self, db: Session):
        self.db = db

    async def create_grid(
        self,
        project_id: str,
        name: str,
        grid_type: GridType,
        analysis_type: AnalysisType,
        config: Optional[Dict[str, Any]] = None
    ) -> AnalysisGrid:
        """Create a new analysis grid"""

        project = self.db.query(Project).filter_by(id=project_id).first()
        if not project:
            raise ValueError("Project not found")

        # Define default columns based on grid type
        columns = self._get_default_columns(grid_type)
        rows = self._get_default_rows(grid_type)

        grid = AnalysisGrid(
            id=_uid(),
            org_id=project.org_id,
            project_id=project_id,
            name=name,
            analysis_type=analysis_type,
            grid_type=grid_type,
            columns=columns,
            rows=rows,
            config=config or {}
        )

        self.db.add(grid)
        self.db.commit()

        return grid

    def _get_default_columns(self, grid_type: GridType) -> List[Dict]:
        """Get default column structure based on grid type"""

        if grid_type == GridType.THEMES:
            return [
                {"id": "theme", "label": "Theme", "width": 200},
                {"id": "description", "label": "Description", "width": 300},
                {"id": "frequency", "label": "Frequency", "width": 100},
                {"id": "sentiment", "label": "Sentiment", "width": 100},
                {"id": "evidence", "label": "Evidence", "width": 200}
            ]
        elif grid_type == GridType.QUESTIONS:
            return [
                {"id": "question", "label": "Research Question", "width": 250},
                {"id": "findings", "label": "Key Findings", "width": 400},
                {"id": "evidence", "label": "Supporting Evidence", "width": 300}
            ]
        elif grid_type == GridType.JOURNEY:
            return [
                {"id": "stage", "label": "Journey Stage", "width": 150},
                {"id": "touchpoints", "label": "Touchpoints", "width": 200},
                {"id": "pain_points", "label": "Pain Points", "width": 250},
                {"id": "opportunities", "label": "Opportunities", "width": 250}
            ]
        elif grid_type == GridType.PERSONAS:
            return [
                {"id": "persona", "label": "Persona", "width": 150},
                {"id": "characteristics", "label": "Characteristics", "width": 300},
                {"id": "needs", "label": "Needs", "width": 250},
                {"id": "behaviors", "label": "Behaviors", "width": 250}
            ]
        else:  # CONCEPTS
            return [
                {"id": "concept", "label": "Concept", "width": 200},
                {"id": "appeal", "label": "Appeal", "width": 150},
                {"id": "concerns", "label": "Concerns", "width": 200},
                {"id": "improvements", "label": "Suggested Improvements", "width": 300}
            ]

    def _get_default_rows(self, grid_type: GridType) -> List[Dict]:
        """Get default row structure based on grid type"""

        # Start with empty rows, will be populated by analysis
        return []

    async def create_comparative_grid(
        self,
        project_id: str,
        name: str,
        grid_type: GridType,
        comparison_dimensions: List[str],
        config: Optional[Dict[str, Any]] = None
    ) -> AnalysisGrid:
        """Create a comparative analysis grid for multiple markets/segments"""

        project = self.db.query(Project).filter_by(id=project_id).first()
        if not project:
            raise ValueError("Project not found")

        # Extended columns for comparison
        base_columns = self._get_default_columns(grid_type)

        # Add comparison dimension columns
        for dimension in comparison_dimensions:
            base_columns.append({
                "id": f"compare_{dimension}",
                "label": dimension,
                "width": 200,
                "type": "comparison"
            })

        grid = AnalysisGrid(
            id=_uid(),
            org_id=project.org_id,
            project_id=project_id,
            name=name,
            analysis_type=AnalysisType.COMPARATIVE,
            grid_type=grid_type,
            columns=base_columns,
            rows=[],
            comparison_dimensions=comparison_dimensions,
            config=config or {}
        )

        self.db.add(grid)
        self.db.commit()

        return grid

    async def create_multimarket_grid(
        self,
        project_id: str,
        name: str,
        markets: List[str],
        grid_type: GridType = GridType.THEMES
    ) -> AnalysisGrid:
        """Create a multi-market comparison grid"""

        # Special configuration for multimarket
        config = {
            "markets": markets,
            "enable_regional_insights": True,
            "show_market_differences": True
        }

        return await self.create_comparative_grid(
            project_id=project_id,
            name=name,
            grid_type=grid_type,
            comparison_dimensions=markets,
            config=config
        )

    async def add_cell(
        self,
        grid_id: str,
        row_id: str,
        column_id: str,
        content: str,
        evidence_ids: Optional[List[str]] = None,
        metadata: Optional[Dict] = None
    ) -> GridCell:
        """Add or update a cell in the grid"""

        # Check if cell exists
        cell = self.db.query(GridCell).filter_by(
            grid_id=grid_id,
            row_id=row_id,
            column_id=column_id
        ).first()

        if not cell:
            cell = GridCell(
                id=_uid(),
                grid_id=grid_id,
                row_id=row_id,
                column_id=column_id
            )
            self.db.add(cell)

        cell.content = content
        cell.evidence_ids = evidence_ids or []
        cell.meta_data = metadata or {}
        cell.updated_at = datetime.utcnow()

        self.db.commit()
        return cell

    async def populate_from_transcripts(
        self,
        grid_id: str,
        transcript_ids: List[str]
    ) -> Dict[str, Any]:
        """Auto-populate grid from transcript analysis"""

        grid = self.db.query(AnalysisGrid).filter_by(id=grid_id).first()
        if not grid:
            raise ValueError("Grid not found")

        # Get all segments from transcripts
        segments = self.db.query(TranscriptSegment).join(
            Transcript
        ).filter(
            Transcript.id.in_(transcript_ids)
        ).all()

        # Extract themes (mock implementation)
        themes = self._extract_themes(segments)

        cells_created = 0
        for theme in themes:
            # Create row for theme
            row_id = f"theme_{theme['id']}"

            # Add to grid rows if not exists
            rows = grid.rows or []
            if not any(r.get('id') == row_id for r in rows):
                rows.append({
                    "id": row_id,
                    "label": theme['name']
                })
                grid.rows = rows

            # Create cells for this theme
            for col in grid.columns:
                content = self._generate_cell_content(theme, col['id'])
                if content:
                    await self.add_cell(
                        grid_id=grid_id,
                        row_id=row_id,
                        column_id=col['id'],
                        content=content,
                        evidence_ids=theme.get('evidence_ids', [])
                    )
                    cells_created += 1

        self.db.commit()

        return {
            "themes_found": len(themes),
            "cells_created": cells_created
        }

    def _extract_themes(self, segments: List[TranscriptSegment]) -> List[Dict]:
        """Extract themes from transcript segments (mock)"""

        # Mock theme extraction - in production, use NLP/AI
        themes = [
            {
                "id": "price_sensitivity",
                "name": "Price Sensitivity",
                "description": "Concerns about pricing and value for money",
                "frequency": 45,
                "sentiment": -0.3,
                "evidence_ids": []
            },
            {
                "id": "convenience",
                "name": "Convenience",
                "description": "Importance of easy access and quick service",
                "frequency": 62,
                "sentiment": 0.7,
                "evidence_ids": []
            },
            {
                "id": "trust_issues",
                "name": "Trust & Security",
                "description": "Concerns about data security and platform trustworthiness",
                "frequency": 38,
                "sentiment": -0.5,
                "evidence_ids": []
            },
            {
                "id": "local_preference",
                "name": "Local Preference",
                "description": "Preference for local brands and services",
                "frequency": 51,
                "sentiment": 0.6,
                "evidence_ids": []
            }
        ]

        return themes

    def _generate_cell_content(self, theme: Dict, column_id: str) -> Optional[str]:
        """Generate content for a specific cell"""

        if column_id == "theme":
            return theme['name']
        elif column_id == "description":
            return theme['description']
        elif column_id == "frequency":
            return str(theme['frequency'])
        elif column_id == "sentiment":
            sentiment = theme['sentiment']
            if sentiment > 0.5:
                return "Very Positive"
            elif sentiment > 0:
                return "Positive"
            elif sentiment < -0.5:
                return "Very Negative"
            elif sentiment < 0:
                return "Negative"
            else:
                return "Neutral"
        elif column_id == "evidence":
            return f"{len(theme.get('evidence_ids', []))} quotes"

        return None

    async def compare_markets(
        self,
        grid_id: str,
        markets: List[str]
    ) -> Dict[str, Any]:
        """Generate market comparison for a grid"""

        grid = self.db.query(AnalysisGrid).filter_by(id=grid_id).first()
        if not grid:
            raise ValueError("Grid not found")

        # Mock comparison data
        comparisons = {
            "Indonesia": {
                "price_sensitivity": "Very High - Price is primary concern",
                "convenience": "High - Values quick delivery",
                "trust_issues": "Moderate - Prefers COD payment",
                "local_preference": "Very High - Strong local brand preference"
            },
            "Singapore": {
                "price_sensitivity": "Moderate - Values quality over price",
                "convenience": "Very High - Expects fast service",
                "trust_issues": "Low - Comfortable with digital payments",
                "local_preference": "Low - Open to international brands"
            },
            "Thailand": {
                "price_sensitivity": "High - Seeks promotions and deals",
                "convenience": "High - Mobile-first approach",
                "trust_issues": "Moderate - Growing digital adoption",
                "local_preference": "High - Prefers Thai language support"
            }
        }

        # Add comparison cells
        for market, insights in comparisons.items():
            if market in markets:
                for theme_id, insight in insights.items():
                    await self.add_cell(
                        grid_id=grid_id,
                        row_id=f"theme_{theme_id}",
                        column_id=f"compare_{market}",
                        content=insight,
                        metadata={"market": market}
                    )

        self.db.commit()

        return {
            "markets_compared": len(markets),
            "comparisons_added": len(markets) * len(comparisons.get(markets[0], {}))
        }


class EvidenceService:
    """Service for managing evidence panel"""

    def __init__(self, db: Session):
        self.db = db

    async def create_evidence(
        self,
        project_id: str,
        source_type: str,
        source_id: str,
        content: str,
        evidence_type: str = "quote",
        **kwargs
    ) -> Evidence:
        """Create a new piece of evidence"""

        project = self.db.query(Project).filter_by(id=project_id).first()
        if not project:
            raise ValueError("Project not found")

        evidence = Evidence(
            id=_uid(),
            org_id=project.org_id,
            project_id=project_id,
            source_type=source_type,
            source_id=source_id,
            content=content,
            evidence_type=evidence_type,
            **kwargs
        )

        self.db.add(evidence)
        self.db.commit()

        return evidence

    async def extract_from_transcript(
        self,
        transcript_id: str,
        themes: Optional[List[str]] = None
    ) -> List[Evidence]:
        """Extract evidence quotes from transcript"""

        segments = self.db.query(TranscriptSegment).filter_by(
            transcript_id=transcript_id
        ).all()

        evidence_list = []

        # Mock extraction - in production, use AI to identify key quotes
        important_segments = segments[:10] if len(segments) > 10 else segments

        for segment in important_segments:
            evidence = await self.create_evidence(
                project_id=self.db.query(Transcript).filter_by(
                    id=transcript_id
                ).first().project_id,
                source_type="transcript",
                source_id=transcript_id,
                content=segment.text,
                segment_id=segment.id,
                speaker=segment.speaker,
                themes=themes or [],
                significance="medium"
            )
            evidence_list.append(evidence)

        return evidence_list

    async def search_evidence(
        self,
        project_id: str,
        themes: Optional[List[str]] = None,
        evidence_type: Optional[str] = None,
        market: Optional[str] = None
    ) -> List[Evidence]:
        """Search for evidence based on filters"""

        query = self.db.query(Evidence).filter_by(project_id=project_id)

        if evidence_type:
            query = query.filter_by(evidence_type=evidence_type)

        if market:
            query = query.filter_by(market=market)

        # Note: For JSON column filtering, would need more complex query
        # This is simplified for mock

        return query.all()

    async def link_to_insight(
        self,
        evidence_ids: List[str],
        insight_id: str
    ) -> Dict[str, Any]:
        """Link evidence to an insight"""

        insight = self.db.query(Insight).filter_by(id=insight_id).first()
        if not insight:
            raise ValueError("Insight not found")

        # Add evidence IDs to insight
        current_ids = insight.evidence_ids or []
        insight.evidence_ids = list(set(current_ids + evidence_ids))

        self.db.commit()

        return {
            "insight_id": insight_id,
            "evidence_linked": len(evidence_ids),
            "total_evidence": len(insight.evidence_ids)
        }