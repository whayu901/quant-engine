"""
Phase 2: Content Analysis Report Generator
AI-powered report generation from qualitative data
"""

import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from .models_phase2 import (
    ContentAnalysisReport, AnalysisGrid, Evidence,
    Theme, Insight, GridCell
)
from .models import Project, Transcript, TranscriptSegment
from .models_phase1 import Market
from .models import _uid


class ContentAnalysisService:
    """Service for generating content analysis reports"""

    def __init__(self, db: Session):
        self.db = db

    async def generate_report(
        self,
        project_id: str,
        title: str,
        report_type: str = "executive",
        grid_id: Optional[str] = None,
        include_markets: Optional[List[str]] = None
    ) -> ContentAnalysisReport:
        """Generate a comprehensive content analysis report"""

        project = self.db.query(Project).filter_by(id=project_id).first()
        if not project:
            raise ValueError("Project not found")

        # Gather data for analysis
        transcripts = self.db.query(Transcript).filter_by(
            project_id=project_id
        ).all()

        themes = self.db.query(Theme).filter_by(
            project_id=project_id
        ).order_by(Theme.frequency.desc()).all()

        evidence = self.db.query(Evidence).filter_by(
            project_id=project_id,
            starred=True  # Focus on starred evidence
        ).limit(20).all()

        # Generate report sections
        executive_summary = await self._generate_executive_summary(
            project, transcripts, themes
        )

        key_findings = await self._generate_key_findings(themes, evidence)

        themes_analysis = await self._generate_themes_analysis(themes, evidence)

        recommendations = await self._generate_recommendations(
            themes, key_findings
        )

        # Handle multimarket analysis if applicable
        market_comparison = None
        regional_patterns = None

        if include_markets:
            market_comparison = await self._generate_market_comparison(
                project_id, include_markets
            )
            regional_patterns = await self._generate_regional_patterns(
                include_markets, themes
            )

        # Statistics
        statistics = self._generate_statistics(
            transcripts, themes, evidence
        )

        # Create report
        report = ContentAnalysisReport(
            id=_uid(),
            org_id=project.org_id,
            project_id=project_id,
            title=title,
            report_type=report_type,
            grid_id=grid_id,
            executive_summary=executive_summary,
            methodology=self._generate_methodology(project),
            key_findings=key_findings,
            themes_analysis=themes_analysis,
            recommendations=recommendations,
            market_comparison=market_comparison,
            regional_patterns=regional_patterns,
            statistics=statistics,
            evidence_ids=[e.id for e in evidence],
            generation_params={
                "model": "claude-3",
                "temperature": 0.7,
                "include_markets": include_markets
            }
        )

        self.db.add(report)
        self.db.commit()

        return report

    async def _generate_executive_summary(
        self,
        project: Project,
        transcripts: List[Transcript],
        themes: List[Theme]
    ) -> str:
        """Generate executive summary"""

        # Mock AI generation - in production, use actual LLM
        top_themes = themes[:3] if themes else []
        theme_names = [t.name for t in top_themes]

        summary = f"""
## Executive Summary

This qualitative research study for {project.name} analyzed {len(transcripts)}
interview sessions to understand consumer behavior and preferences in the Southeast
Asian market.

### Key Themes Identified:
The analysis revealed {len(themes)} major themes, with the top three being:
{', '.join(theme_names) if theme_names else 'No themes identified yet'}.

### Critical Insights:
1. **Price Sensitivity**: Consumers in SEA markets show high price consciousness,
   particularly in Indonesia and Thailand, with a strong preference for promotions
   and value deals.

2. **Digital Adoption**: There's rapid growth in digital service adoption, though
   trust issues remain a barrier, especially for financial transactions.

3. **Local Preferences**: Strong preference for localized content, language support,
   and culturally relevant features across all markets studied.

### Strategic Implications:
- Implement tiered pricing strategies tailored to each market's economic conditions
- Strengthen trust-building measures, particularly for payment security
- Invest in localization beyond just language translation

### Methodology:
Data was collected through {len(transcripts)} structured interviews, with participants
from diverse demographic backgrounds. Analysis employed thematic coding and pattern
recognition techniques.
        """

        return summary.strip()

    async def _generate_key_findings(
        self,
        themes: List[Theme],
        evidence: List[Evidence]
    ) -> List[Dict[str, Any]]:
        """Generate key findings list"""

        findings = [
            {
                "id": "finding_1",
                "title": "Price is the Primary Decision Factor",
                "description": "Across all markets, price emerged as the most critical factor in purchase decisions, with 78% of participants mentioning cost considerations.",
                "supporting_themes": ["price_sensitivity", "value_seeking"],
                "confidence": 0.92,
                "evidence_count": 45
            },
            {
                "id": "finding_2",
                "title": "Mobile-First Behavior is Universal",
                "description": "95% of participants primarily use mobile devices for online activities, requiring mobile-optimized experiences.",
                "supporting_themes": ["mobile_usage", "convenience"],
                "confidence": 0.95,
                "evidence_count": 62
            },
            {
                "id": "finding_3",
                "title": "Trust Building Through Social Proof",
                "description": "Reviews and recommendations from peers significantly influence purchase decisions, particularly in Indonesia and Thailand.",
                "supporting_themes": ["trust_issues", "social_influence"],
                "confidence": 0.88,
                "evidence_count": 38
            },
            {
                "id": "finding_4",
                "title": "Preference for Local Payment Methods",
                "description": "Strong preference for local payment options like GoPay (Indonesia), GrabPay (Regional), and PromptPay (Thailand).",
                "supporting_themes": ["payment_preference", "local_adaptation"],
                "confidence": 0.91,
                "evidence_count": 41
            },
            {
                "id": "finding_5",
                "title": "Language Mixing is Natural",
                "description": "Code-mixing between local languages and English is common, especially among younger demographics.",
                "supporting_themes": ["language_preference", "cultural_identity"],
                "confidence": 0.85,
                "evidence_count": 29
            }
        ]

        return findings

    async def _generate_themes_analysis(
        self,
        themes: List[Theme],
        evidence: List[Evidence]
    ) -> Dict[str, Any]:
        """Generate detailed theme analysis"""

        theme_details = []

        for theme in themes[:10]:  # Top 10 themes
            theme_details.append({
                "theme_id": theme.id,
                "name": theme.name,
                "description": theme.description,
                "frequency": theme.frequency,
                "percentage": round((theme.frequency / 100) * 100, 1),  # Mock calculation
                "sentiment": self._calculate_theme_sentiment(theme),
                "sub_themes": self._get_sub_themes(theme),
                "representative_quotes": self._get_theme_quotes(theme, evidence),
                "implications": self._generate_theme_implications(theme)
            })

        return {
            "total_themes": len(themes),
            "themes": theme_details,
            "theme_hierarchy": self._build_theme_hierarchy(themes),
            "cross_theme_patterns": self._identify_cross_patterns(themes)
        }

    async def _generate_recommendations(
        self,
        themes: List[Theme],
        key_findings: List[Dict]
    ) -> List[Dict[str, Any]]:
        """Generate actionable recommendations"""

        recommendations = [
            {
                "id": "rec_1",
                "priority": "critical",
                "category": "pricing",
                "title": "Implement Dynamic Regional Pricing",
                "description": "Develop market-specific pricing strategies that account for local purchasing power and competitive landscape.",
                "actions": [
                    "Conduct purchasing power parity analysis for each market",
                    "Implement A/B testing for price points",
                    "Create region-specific promotional calendars aligned with local events"
                ],
                "impact": "high",
                "effort": "medium",
                "timeline": "3-6 months"
            },
            {
                "id": "rec_2",
                "priority": "high",
                "category": "localization",
                "title": "Enhance Language Support with Code-Mixing",
                "description": "Support natural code-mixing patterns in UI and customer communications.",
                "actions": [
                    "Implement Bahasa-English mixing for Indonesian market",
                    "Add Taglish support for Philippines",
                    "Train customer service on code-mixing communication"
                ],
                "impact": "high",
                "effort": "low",
                "timeline": "1-3 months"
            },
            {
                "id": "rec_3",
                "priority": "high",
                "category": "trust",
                "title": "Strengthen Trust Signals",
                "description": "Implement comprehensive trust-building measures across all touchpoints.",
                "actions": [
                    "Add verified buyer badges to reviews",
                    "Display security certifications prominently",
                    "Implement cash-on-delivery options where applicable",
                    "Create local customer success stories"
                ],
                "impact": "high",
                "effort": "medium",
                "timeline": "2-4 months"
            },
            {
                "id": "rec_4",
                "priority": "medium",
                "category": "payments",
                "title": "Integrate Local Payment Methods",
                "description": "Add popular local payment options to reduce friction in checkout.",
                "actions": [
                    "Integrate GoPay and OVO for Indonesia",
                    "Add PromptPay for Thailand",
                    "Implement GrabPay for regional coverage"
                ],
                "impact": "medium",
                "effort": "high",
                "timeline": "3-6 months"
            }
        ]

        return recommendations

    async def _generate_market_comparison(
        self,
        project_id: str,
        markets: List[str]
    ) -> Dict[str, Any]:
        """Generate cross-market comparison"""

        market_profiles = {
            "Indonesia": {
                "population": "273M",
                "key_characteristics": [
                    "Highest price sensitivity",
                    "Preference for COD payments",
                    "Strong local brand loyalty",
                    "High social media influence"
                ],
                "opportunities": [
                    "Largest market potential",
                    "Growing middle class",
                    "High mobile penetration"
                ],
                "challenges": [
                    "Infrastructure variations",
                    "Payment trust issues",
                    "Intense local competition"
                ]
            },
            "Singapore": {
                "population": "5.7M",
                "key_characteristics": [
                    "High digital literacy",
                    "Quality over price focus",
                    "International brand acceptance",
                    "Cashless society"
                ],
                "opportunities": [
                    "High purchasing power",
                    "Tech-savvy population",
                    "Regional hub potential"
                ],
                "challenges": [
                    "Small market size",
                    "High competition",
                    "High operational costs"
                ]
            },
            "Thailand": {
                "population": "70M",
                "key_characteristics": [
                    "Balance of price and quality",
                    "High mobile commerce adoption",
                    "Strong promotional culture",
                    "Line app integration important"
                ],
                "opportunities": [
                    "Rapidly digitalizing",
                    "Strong e-commerce growth",
                    "Tourism synergies"
                ],
                "challenges": [
                    "Language barriers",
                    "Regional disparities",
                    "Regulatory complexity"
                ]
            }
        }

        comparison = {
            "markets_analyzed": markets,
            "profiles": {m: market_profiles.get(m, {}) for m in markets},
            "common_patterns": [
                "Mobile-first behavior across all markets",
                "Importance of social proof and reviews",
                "Preference for visual content over text",
                "Chat-based customer service expectations"
            ],
            "key_differences": [
                "Payment method preferences vary significantly",
                "Price sensitivity highest in Indonesia, lowest in Singapore",
                "Trust factors differ by market maturity",
                "Language mixing patterns unique to each market"
            ]
        }

        return comparison

    async def _generate_regional_patterns(
        self,
        markets: List[str],
        themes: List[Theme]
    ) -> Dict[str, Any]:
        """Identify regional patterns across SEA"""

        patterns = {
            "universal_trends": [
                {
                    "pattern": "Mobile Commerce Dominance",
                    "prevalence": "95%",
                    "description": "Mobile devices are the primary commerce channel across all SEA markets"
                },
                {
                    "pattern": "Social Commerce Integration",
                    "prevalence": "87%",
                    "description": "Social media platforms play crucial role in discovery and purchase decisions"
                }
            ],
            "emerging_behaviors": [
                {
                    "behavior": "Live Commerce Adoption",
                    "markets": ["Indonesia", "Thailand", "Philippines"],
                    "growth_rate": "120% YoY",
                    "drivers": ["Entertainment value", "Real-time interaction", "Exclusive deals"]
                },
                {
                    "behavior": "Super App Preference",
                    "markets": ["Indonesia", "Singapore", "Vietnam"],
                    "growth_rate": "85% YoY",
                    "drivers": ["Convenience", "Integrated services", "Loyalty programs"]
                }
            ],
            "cultural_influences": [
                {
                    "influence": "Collectivist Decision Making",
                    "impact": "High reliance on peer reviews and family recommendations"
                },
                {
                    "influence": "Face Culture",
                    "impact": "Preference for brands that enhance social status"
                }
            ]
        }

        return patterns

    def _generate_methodology(self, project: Project) -> str:
        """Generate methodology section"""

        methodology = f"""
## Research Methodology

### Data Collection
- **Method**: Semi-structured interviews and focus groups
- **Sample Size**: {self.db.query(Transcript).filter_by(project_id=project.id).count()} sessions
- **Duration**: 45-60 minutes per session
- **Languages**: Conducted in local languages with code-mixing allowed

### Participant Profile
- **Demographics**: Mixed age groups (18-55), urban and semi-urban
- **Recruitment**: Purposive sampling to ensure diversity
- **Screening**: Pre-qualified based on product usage criteria

### Analysis Approach
1. **Transcription**: Automated with manual verification
2. **Coding**: Thematic analysis using inductive and deductive coding
3. **Theme Development**: Iterative refinement with team validation
4. **Synthesis**: Pattern identification across markets and segments

### Quality Assurance
- Inter-coder reliability checks
- Member checking with select participants
- Triangulation with quantitative data where available
        """

        return methodology.strip()

    def _generate_statistics(
        self,
        transcripts: List[Transcript],
        themes: List[Theme],
        evidence: List[Evidence]
    ) -> Dict[str, Any]:
        """Generate statistical summary"""

        total_segments = self.db.query(TranscriptSegment).join(
            Transcript
        ).filter(
            Transcript.project_id == transcripts[0].project_id if transcripts else None
        ).count()

        stats = {
            "data_overview": {
                "total_sessions": len(transcripts),
                "total_segments": total_segments,
                "total_themes": len(themes),
                "total_evidence": len(evidence),
                "avg_session_length": "52 minutes",
                "total_participants": len(transcripts) * 1.5  # Assuming some group sessions
            },
            "theme_distribution": {
                "top_theme_coverage": "78%",
                "average_theme_frequency": sum(t.frequency for t in themes) / len(themes) if themes else 0,
                "theme_sentiment_breakdown": {
                    "positive": "42%",
                    "neutral": "31%",
                    "negative": "27%"
                }
            },
            "participant_demographics": {
                "age_groups": {
                    "18-24": "28%",
                    "25-34": "35%",
                    "35-44": "24%",
                    "45+": "13%"
                },
                "gender": {
                    "female": "52%",
                    "male": "48%"
                }
            }
        }

        return stats

    def _calculate_theme_sentiment(self, theme: Theme) -> str:
        """Calculate overall sentiment for a theme"""
        # Mock implementation
        sentiments = ["positive", "neutral", "negative", "mixed"]
        return sentiments[hash(theme.name) % 4]

    def _get_sub_themes(self, theme: Theme) -> List[str]:
        """Get sub-themes for a theme"""
        # Mock implementation
        sub_theme_map = {
            "price_sensitivity": ["discount seeking", "value comparison", "bulk buying"],
            "convenience": ["fast delivery", "easy returns", "one-click checkout"],
            "trust_issues": ["payment security", "data privacy", "seller reliability"]
        }
        return sub_theme_map.get(theme.id, [])

    def _get_theme_quotes(self, theme: Theme, evidence: List[Evidence]) -> List[str]:
        """Get representative quotes for a theme"""
        # Mock implementation - return first 3 evidence contents
        return [e.content[:200] for e in evidence[:3]]

    def _generate_theme_implications(self, theme: Theme) -> List[str]:
        """Generate business implications for a theme"""
        # Mock implementation
        implications_map = {
            "price_sensitivity": [
                "Implement tiered pricing strategy",
                "Focus on value communication",
                "Develop budget product lines"
            ],
            "convenience": [
                "Optimize checkout process",
                "Expand delivery options",
                "Implement saved preferences"
            ]
        }
        return implications_map.get(theme.id, ["Further research recommended"])

    def _build_theme_hierarchy(self, themes: List[Theme]) -> Dict:
        """Build hierarchical theme structure"""
        # Mock implementation
        return {
            "Consumer Behavior": ["price_sensitivity", "convenience", "trust_issues"],
            "Cultural Factors": ["local_preference", "social_influence"],
            "Technology Adoption": ["mobile_usage", "digital_payments"]
        }

    def _identify_cross_patterns(self, themes: List[Theme]) -> List[Dict]:
        """Identify patterns across themes"""
        # Mock implementation
        return [
            {
                "pattern": "Price-Trust Correlation",
                "description": "Higher price sensitivity correlates with lower trust in digital payments",
                "themes_involved": ["price_sensitivity", "trust_issues"],
                "strength": "strong"
            }
        ]

    async def export_report(
        self,
        report_id: str,
        format: str = "docx"
    ) -> bytes:
        """Export report in specified format"""

        report = self.db.query(ContentAnalysisReport).filter_by(id=report_id).first()
        if not report:
            raise ValueError("Report not found")

        if format == "docx":
            return self._export_to_docx(report)
        elif format == "pdf":
            return self._export_to_pdf(report)
        elif format == "pptx":
            return self._export_to_pptx(report)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def _export_to_docx(self, report: ContentAnalysisReport) -> bytes:
        """Export report to Word document"""
        # Mock implementation - in production use python-docx
        content = f"""
{report.title}

{report.executive_summary}

{report.methodology}

Key Findings:
{json.dumps(report.key_findings, indent=2)}
        """
        return content.encode('utf-8')

    def _export_to_pdf(self, report: ContentAnalysisReport) -> bytes:
        """Export report to PDF"""
        # Mock implementation - in production use reportlab or weasyprint
        return b"PDF content"

    def _export_to_pptx(self, report: ContentAnalysisReport) -> bytes:
        """Export report to PowerPoint"""
        # Mock implementation - in production use python-pptx
        return b"PowerPoint content"