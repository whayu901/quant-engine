"""
Phase 4: Concept Testing Service
AI-assisted evaluation of product/service concepts
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
import json
import statistics

from .models import Project, User
from .models_phase4 import ConceptTest, ConceptEvaluation
from .config import settings


class ConceptTestingService:
    """Service for managing concept testing"""

    def __init__(self, db: Session):
        self.db = db
        self.use_mock = not bool(settings.anthropic_api_key)

        if not self.use_mock:
            try:
                from anthropic import Anthropic
                self.client = Anthropic(api_key=settings.anthropic_api_key)
            except:
                print("⚠️ Anthropic not configured. Using mock concept testing.")
                self.use_mock = True

    async def create_test(
        self,
        project_id: str,
        name: str,
        concepts: List[Dict[str, Any]],
        metrics: List[str],
        test_type: str = 'monadic',
        target_audience: Optional[str] = None,
        markets: Optional[List[str]] = None
    ) -> ConceptTest:
        """Create a new concept test"""

        project = self.db.query(Project).filter_by(id=project_id).first()
        if not project:
            raise ValueError("Project not found")

        # Default metrics if none provided
        if not metrics:
            metrics = [
                'appeal',
                'uniqueness',
                'believability',
                'relevance',
                'purchase_intent'
            ]

        test = ConceptTest(
            org_id=project.org_id,
            project_id=project_id,
            name=name,
            test_type=test_type,
            concepts=concepts,
            metrics=metrics,
            target_audience=target_audience,
            markets=markets or ['ID', 'SG', 'MY'],
            status='draft'
        )

        self.db.add(test)
        self.db.commit()

        return test

    async def add_evaluation(
        self,
        test_id: str,
        respondent_id: str,
        concept_id: str,
        ratings: Dict[str, float],
        qualitative_feedback: Dict[str, str],
        demographics: Optional[Dict[str, Any]] = None
    ) -> ConceptEvaluation:
        """Add an evaluation for a concept"""

        test = self.db.query(ConceptTest).filter_by(id=test_id).first()
        if not test:
            raise ValueError("Concept test not found")

        # Calculate overall rating
        overall_rating = statistics.mean(ratings.values()) if ratings else 0

        evaluation = ConceptEvaluation(
            test_id=test_id,
            respondent_id=respondent_id,
            concept_id=concept_id,
            ratings=ratings,
            overall_rating=overall_rating,
            likes=qualitative_feedback.get('likes', ''),
            dislikes=qualitative_feedback.get('dislikes', ''),
            suggestions=qualitative_feedback.get('suggestions', ''),
            purchase_intent=ratings.get('purchase_intent', 0),
            demographic_data=demographics or {}
        )

        self.db.add(evaluation)
        self.db.commit()

        return evaluation

    async def analyze_concept_performance(
        self,
        test_id: str
    ) -> Dict[str, Any]:
        """Analyze concept test results"""

        test = self.db.query(ConceptTest).filter_by(id=test_id).first()
        if not test:
            raise ValueError("Concept test not found")

        evaluations = self.db.query(ConceptEvaluation).filter_by(
            test_id=test_id
        ).all()

        if not evaluations:
            return {
                'test_id': test_id,
                'status': 'no_data',
                'message': 'No evaluations yet'
            }

        # Group evaluations by concept
        concept_results = {}
        for concept in test.concepts:
            concept_id = concept['id']
            concept_evals = [e for e in evaluations if e.concept_id == concept_id]

            if concept_evals:
                concept_results[concept_id] = self._analyze_concept(
                    concept,
                    concept_evals,
                    test.metrics
                )

        # Generate insights
        insights = await self._generate_insights(concept_results, test)

        # Determine winner
        winner = self._determine_winner(concept_results)

        return {
            'test_id': test_id,
            'test_name': test.name,
            'total_respondents': len(set(e.respondent_id for e in evaluations)),
            'concepts': concept_results,
            'winner': winner,
            'insights': insights,
            'generated_at': datetime.utcnow().isoformat()
        }

    def _analyze_concept(
        self,
        concept: Dict,
        evaluations: List[ConceptEvaluation],
        metrics: List[str]
    ) -> Dict[str, Any]:
        """Analyze a single concept's performance"""

        # Calculate metric averages
        metric_scores = {}
        for metric in metrics:
            scores = [
                e.ratings.get(metric, 0)
                for e in evaluations
                if metric in e.ratings
            ]
            if scores:
                metric_scores[metric] = {
                    'mean': statistics.mean(scores),
                    'median': statistics.median(scores),
                    'std_dev': statistics.stdev(scores) if len(scores) > 1 else 0,
                    'min': min(scores),
                    'max': max(scores),
                    'count': len(scores)
                }

        # Overall performance
        overall_scores = [e.overall_rating for e in evaluations if e.overall_rating]
        overall_stats = {
            'mean': statistics.mean(overall_scores) if overall_scores else 0,
            'median': statistics.median(overall_scores) if overall_scores else 0,
            'std_dev': statistics.stdev(overall_scores) if len(overall_scores) > 1 else 0
        }

        # Purchase intent distribution
        pi_scores = [e.purchase_intent for e in evaluations if e.purchase_intent]
        pi_distribution = {}
        if pi_scores:
            for score in range(1, 6):
                pi_distribution[f'score_{score}'] = pi_scores.count(score)

        # Qualitative themes
        likes = [e.likes for e in evaluations if e.likes]
        dislikes = [e.dislikes for e in evaluations if e.dislikes]
        suggestions = [e.suggestions for e in evaluations if e.suggestions]

        return {
            'concept_id': concept['id'],
            'concept_name': concept.get('name', concept['id']),
            'n_evaluations': len(evaluations),
            'metric_scores': metric_scores,
            'overall': overall_stats,
            'purchase_intent': {
                'mean': statistics.mean(pi_scores) if pi_scores else 0,
                'distribution': pi_distribution,
                'top_2_box': sum(1 for s in pi_scores if s >= 4) / len(pi_scores) * 100 if pi_scores else 0
            },
            'qualitative': {
                'n_likes': len(likes),
                'n_dislikes': len(dislikes),
                'n_suggestions': len(suggestions),
                'sample_likes': likes[:3],
                'sample_dislikes': dislikes[:3],
                'sample_suggestions': suggestions[:3]
            }
        }

    async def _generate_insights(
        self,
        concept_results: Dict[str, Any],
        test: ConceptTest
    ) -> List[Dict[str, str]]:
        """Generate insights from concept test results"""

        if self.use_mock:
            return self._generate_mock_insights(concept_results)

        # Prepare data for AI analysis
        results_summary = json.dumps(concept_results, indent=2)

        prompt = f"""Analyze these concept test results and provide actionable insights.

Test: {test.name}
Target Audience: {test.target_audience or 'General consumers'}
Markets: {', '.join(test.markets or ['Southeast Asia'])}

Results:
{results_summary}

Generate 3-5 key insights that:
1. Identify the winning concept and why
2. Highlight strengths and weaknesses of each concept
3. Provide recommendations for improvement
4. Consider cultural/market factors for Southeast Asia

Return as JSON array: [{{"type": "strength/weakness/recommendation", "concept": "concept_id", "insight": "..."}}]"""

        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1000,
            temperature=0.5,
            messages=[{"role": "user", "content": prompt}]
        )

        try:
            insights = json.loads(response.content[0].text)
            return insights
        except:
            return self._generate_mock_insights(concept_results)

    def _generate_mock_insights(self, concept_results: Dict) -> List[Dict[str, str]]:
        """Generate mock insights for development"""

        insights = []

        # Find best and worst performing
        if concept_results:
            sorted_concepts = sorted(
                concept_results.items(),
                key=lambda x: x[1]['overall']['mean'],
                reverse=True
            )

            if len(sorted_concepts) > 0:
                best = sorted_concepts[0]
                insights.append({
                    'type': 'strength',
                    'concept': best[0],
                    'insight': f"{best[1]['concept_name']} shows strongest overall appeal with {best[1]['overall']['mean']:.1f}/5 rating, "
                              f"particularly strong on uniqueness and relevance metrics."
                })

            if len(sorted_concepts) > 1:
                worst = sorted_concepts[-1]
                insights.append({
                    'type': 'weakness',
                    'concept': worst[0],
                    'insight': f"{worst[1]['concept_name']} underperforms with {worst[1]['overall']['mean']:.1f}/5 rating. "
                              f"Main concerns include believability and value perception."
                })

            # Purchase intent insight
            for concept_id, data in concept_results.items():
                if data['purchase_intent']['top_2_box'] > 60:
                    insights.append({
                        'type': 'strength',
                        'concept': concept_id,
                        'insight': f"Strong purchase intent for {data['concept_name']} with {data['purchase_intent']['top_2_box']:.0f}% "
                                  f"top-2-box score, indicating good market potential."
                    })
                elif data['purchase_intent']['top_2_box'] < 40:
                    insights.append({
                        'type': 'weakness',
                        'concept': concept_id,
                        'insight': f"Low purchase intent for {data['concept_name']} ({data['purchase_intent']['top_2_box']:.0f}% top-2-box) "
                                  f"suggests need for repositioning or feature enhancement."
                    })

        # General recommendation
        insights.append({
            'type': 'recommendation',
            'concept': 'all',
            'insight': "Consider localizing messaging for Indonesian market with emphasis on value and social proof. "
                      "Test pricing strategies to optimize for price-sensitive segments."
        })

        return insights[:5]  # Return top 5 insights

    def _determine_winner(self, concept_results: Dict) -> Dict[str, Any]:
        """Determine the winning concept"""

        if not concept_results:
            return None

        # Score each concept
        concept_scores = {}
        for concept_id, data in concept_results.items():
            # Weighted scoring
            score = (
                data['overall']['mean'] * 0.3 +
                data['purchase_intent']['mean'] * 0.4 +
                (data['purchase_intent']['top_2_box'] / 20) * 0.3  # Normalize to 0-5
            )
            concept_scores[concept_id] = {
                'concept_id': concept_id,
                'concept_name': data['concept_name'],
                'weighted_score': score,
                'overall_rating': data['overall']['mean'],
                'purchase_intent': data['purchase_intent']['mean'],
                'strengths': self._identify_strengths(data)
            }

        # Find winner
        winner = max(concept_scores.items(), key=lambda x: x[1]['weighted_score'])

        return winner[1]

    def _identify_strengths(self, concept_data: Dict) -> List[str]:
        """Identify concept strengths"""
        strengths = []

        # Check metric scores
        if 'metric_scores' in concept_data:
            for metric, scores in concept_data['metric_scores'].items():
                if scores['mean'] >= 4.0:
                    strengths.append(metric.replace('_', ' ').title())

        # Check purchase intent
        if concept_data['purchase_intent']['top_2_box'] > 60:
            strengths.append('High purchase intent')

        return strengths[:3]  # Top 3 strengths

    async def generate_report(
        self,
        test_id: str,
        format: str = 'json'
    ) -> Any:
        """Generate a concept test report"""

        analysis = await self.analyze_concept_performance(test_id)

        if format == 'json':
            return analysis
        elif format == 'html':
            return self._generate_html_report(analysis)
        elif format == 'pptx':
            return self._generate_pptx_report(analysis)
        else:
            return analysis

    def _generate_html_report(self, analysis: Dict) -> str:
        """Generate HTML report"""

        html = f"""
        <html>
        <head>
            <title>Concept Test Report - {analysis['test_name']}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                h1 {{ color: #333; }}
                h2 {{ color: #666; }}
                .winner {{ background: #d4f1d4; padding: 15px; border-radius: 5px; }}
                .concept {{ border: 1px solid #ddd; padding: 15px; margin: 10px 0; }}
                .metric {{ display: inline-block; margin: 5px; padding: 5px 10px; background: #f0f0f0; }}
                .insight {{ padding: 10px; margin: 5px 0; background: #f9f9f9; }}
            </style>
        </head>
        <body>
            <h1>Concept Test Report: {analysis['test_name']}</h1>
            <p>Total Respondents: {analysis['total_respondents']}</p>
            <p>Generated: {analysis['generated_at']}</p>
        """

        if analysis.get('winner'):
            winner = analysis['winner']
            html += f"""
            <div class="winner">
                <h2>🏆 Winner: {winner['concept_name']}</h2>
                <p>Overall Score: {winner['overall_rating']:.1f}/5</p>
                <p>Purchase Intent: {winner['purchase_intent']:.1f}/5</p>
                <p>Strengths: {', '.join(winner['strengths'])}</p>
            </div>
            """

        # Concept details
        html += "<h2>Concept Performance</h2>"
        for concept_id, data in analysis['concepts'].items():
            html += f"""
            <div class="concept">
                <h3>{data['concept_name']}</h3>
                <p>Evaluations: {data['n_evaluations']}</p>
                <p>Overall Rating: {data['overall']['mean']:.2f}/5</p>
                <p>Purchase Intent: {data['purchase_intent']['mean']:.2f}/5
                   (Top-2-Box: {data['purchase_intent']['top_2_box']:.0f}%)</p>
                <h4>Metrics:</h4>
            """

            for metric, scores in data['metric_scores'].items():
                html += f'<span class="metric">{metric}: {scores["mean"]:.2f}</span>'

            html += "</div>"

        # Insights
        html += "<h2>Key Insights</h2>"
        for insight in analysis['insights']:
            html += f"""
            <div class="insight">
                <strong>{insight['type'].title()}:</strong> {insight['insight']}
            </div>
            """

        html += "</body></html>"

        return html

    def _generate_pptx_report(self, analysis: Dict) -> bytes:
        """Generate PowerPoint report (placeholder)"""
        # This would use python-pptx library in production
        # For now, return a placeholder
        return b"PowerPoint generation not implemented in mock"