"""
Phase 4: Open Ends Coding Service
AI-assisted coding of open-ended survey responses
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
import json
import re

from .models import Project, User
from .models_phase4 import (
    OpenEndQuestion, OpenEndResponse, CodeFrame,
    TeamType, UserRole, ProjectMember
)
from .config import settings


class OpenEndsCodingService:
    """Service for managing and coding open-ended responses"""

    def __init__(self, db: Session):
        self.db = db
        self.use_mock = not bool(settings.anthropic_api_key)

        if not self.use_mock:
            try:
                from anthropic import Anthropic
                self.client = Anthropic(api_key=settings.anthropic_api_key)
            except:
                print("⚠️ Anthropic not configured. Using mock coding service.")
                self.use_mock = True

    async def import_responses(
        self,
        project_id: str,
        question_code: str,
        question_text: str,
        responses: List[Dict[str, Any]],
        wave: int = 1
    ) -> OpenEndQuestion:
        """Import open-ended responses from survey data"""

        # Create or get question
        question = self.db.query(OpenEndQuestion).filter_by(
            project_id=project_id,
            question_code=question_code,
            wave=wave
        ).first()

        if not question:
            project = self.db.query(Project).filter_by(id=project_id).first()
            if not project:
                raise ValueError("Project not found")

            question = OpenEndQuestion(
                org_id=project.org_id,
                project_id=project_id,
                question_code=question_code,
                question_text=question_text,
                wave=wave,
                total_responses=len(responses)
            )
            self.db.add(question)
            self.db.commit()

        # Import responses
        for resp_data in responses:
            response = OpenEndResponse(
                question_id=question.id,
                respondent_id=resp_data.get('respondent_id', ''),
                response_text=resp_data.get('text', ''),
                language=self._detect_language(resp_data.get('text', ''))
            )
            self.db.add(response)

        self.db.commit()
        return question

    async def create_code_frame(
        self,
        question_id: str,
        codes: List[Dict[str, Any]]
    ) -> List[CodeFrame]:
        """Create code frame for a question"""

        question = self.db.query(OpenEndQuestion).filter_by(id=question_id).first()
        if not question:
            raise ValueError("Question not found")

        code_frames = []
        for code_data in codes:
            code_frame = CodeFrame(
                question_id=question_id,
                code=code_data['code'],
                label=code_data['label'],
                description=code_data.get('description', ''),
                parent_code=code_data.get('parent_code'),
                level=code_data.get('level', 1),
                sort_order=code_data.get('sort_order', 0),
                is_exclusive=code_data.get('is_exclusive', False)
            )
            self.db.add(code_frame)
            code_frames.append(code_frame)

        self.db.commit()
        return code_frames

    async def auto_code_responses(
        self,
        question_id: str,
        sample_size: Optional[int] = None
    ) -> Dict[str, Any]:
        """Use AI to automatically code responses"""

        question = self.db.query(OpenEndQuestion).filter_by(id=question_id).first()
        if not question:
            raise ValueError("Question not found")

        # Get responses to code
        query = self.db.query(OpenEndResponse).filter_by(
            question_id=question_id,
            coded_at=None
        )

        if sample_size:
            responses = query.limit(sample_size).all()
        else:
            responses = query.all()

        # Get code frame
        code_frames = self.db.query(CodeFrame).filter_by(
            question_id=question_id
        ).all()

        if not code_frames:
            # Generate code frame from responses if not exists
            code_frames = await self._generate_code_frame(question, responses[:100])

        # Code each response
        coded_count = 0
        for response in responses:
            codes = await self._code_single_response(
                response.response_text,
                question.question_text,
                code_frames
            )

            response.codes = codes['codes']
            response.ai_suggested_codes = codes['codes']
            response.ai_confidence = codes['confidence']
            response.coded_at = datetime.utcnow()

            coded_count += 1

        # Update question stats
        question.coded_responses = self.db.query(OpenEndResponse).filter_by(
            question_id=question_id
        ).filter(OpenEndResponse.coded_at.isnot(None)).count()

        self.db.commit()

        return {
            'question_id': question_id,
            'total_responses': len(responses),
            'coded_count': coded_count,
            'code_frame_size': len(code_frames)
        }

    async def _generate_code_frame(
        self,
        question: OpenEndQuestion,
        sample_responses: List[OpenEndResponse]
    ) -> List[CodeFrame]:
        """Generate code frame from sample responses"""

        if self.use_mock:
            return self._generate_mock_code_frame(question)

        # Use AI to generate code frame
        response_texts = [r.response_text for r in sample_responses[:50]]

        prompt = f"""Analyze these open-ended survey responses and create a code frame.

Question: {question.question_text}

Sample responses:
{chr(10).join(response_texts[:20])}

Create a hierarchical code frame with:
1. Main themes (level 1)
2. Sub-themes (level 2) where appropriate
3. Keep codes concise but descriptive
4. Include both English and Indonesian labels where relevant

Return as JSON array with structure:
[{{"code": "1", "label": "Price/Value", "description": "...", "level": 1}}, ...]"""

        response = self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1500,
            temperature=0.3,
            messages=[{"role": "user", "content": prompt}]
        )

        # Parse response and create code frames
        try:
            codes_data = json.loads(response.content[0].text)
        except:
            codes_data = self._generate_mock_code_frame(question)

        code_frames = []
        for code_data in codes_data:
            code_frame = CodeFrame(
                question_id=question.id,
                code=code_data['code'],
                label=code_data['label'],
                description=code_data.get('description', ''),
                level=code_data.get('level', 1),
                parent_code=code_data.get('parent_code')
            )
            self.db.add(code_frame)
            code_frames.append(code_frame)

        self.db.commit()
        return code_frames

    def _generate_mock_code_frame(self, question: OpenEndQuestion) -> List[Dict]:
        """Generate mock code frame for development"""

        # Common code frames for different question types
        if any(word in question.question_text.lower() for word in ['like', 'favorite', 'best']):
            return [
                {"code": "1", "label": "Quality/Performance", "description": "Product quality and performance", "level": 1},
                {"code": "1.1", "label": "Durability", "description": "Long-lasting, sturdy", "level": 2, "parent_code": "1"},
                {"code": "1.2", "label": "Effectiveness", "description": "Works well, achieves purpose", "level": 2, "parent_code": "1"},
                {"code": "2", "label": "Price/Value", "description": "Pricing and value for money", "level": 1},
                {"code": "2.1", "label": "Affordable", "description": "Good price, cheap", "level": 2, "parent_code": "2"},
                {"code": "2.2", "label": "Value for money", "description": "Worth the price", "level": 2, "parent_code": "2"},
                {"code": "3", "label": "Features/Innovation", "description": "Product features and innovation", "level": 1},
                {"code": "4", "label": "Brand/Trust", "description": "Brand reputation and trust", "level": 1},
                {"code": "5", "label": "Convenience/Ease", "description": "Easy to use or access", "level": 1},
                {"code": "99", "label": "Other", "description": "Other responses", "level": 1}
            ]

        elif any(word in question.question_text.lower() for word in ['improve', 'change', 'dislike']):
            return [
                {"code": "1", "label": "Price Issues", "description": "Too expensive, pricing concerns", "level": 1},
                {"code": "2", "label": "Quality Problems", "description": "Quality issues and defects", "level": 1},
                {"code": "3", "label": "Service Issues", "description": "Poor service or support", "level": 1},
                {"code": "4", "label": "Availability", "description": "Hard to find, out of stock", "level": 1},
                {"code": "5", "label": "Features Lacking", "description": "Missing features or functionality", "level": 1},
                {"code": "99", "label": "No issues/Other", "description": "No problems or other", "level": 1}
            ]

        else:
            return [
                {"code": "1", "label": "Positive", "description": "Positive sentiments", "level": 1},
                {"code": "2", "label": "Negative", "description": "Negative sentiments", "level": 1},
                {"code": "3", "label": "Neutral/Mixed", "description": "Neutral or mixed sentiments", "level": 1},
                {"code": "4", "label": "Suggestions", "description": "Suggestions for improvement", "level": 1},
                {"code": "99", "label": "Other/Unclear", "description": "Other or unclear responses", "level": 1}
            ]

    async def _code_single_response(
        self,
        response_text: str,
        question_text: str,
        code_frames: List[CodeFrame]
    ) -> Dict[str, Any]:
        """Code a single response using AI"""

        if self.use_mock:
            return self._mock_code_response(response_text, code_frames)

        # Prepare code frame for prompt
        codes_list = "\n".join([
            f"{cf.code}: {cf.label} - {cf.description}"
            for cf in code_frames
        ])

        prompt = f"""Code this survey response according to the code frame.

Question: {question_text}
Response: {response_text}

Code Frame:
{codes_list}

Rules:
- Select ALL applicable codes
- Use specific sub-codes when available
- Code "99" only if no other codes apply
- Consider both explicit and implicit meanings

Return as JSON: {{"codes": ["1", "2.1"], "confidence": 0.85}}"""

        response = self.client.messages.create(
            model="claude-3-haiku-20240307",  # Faster model for coding
            max_tokens=200,
            temperature=0.1,
            messages=[{"role": "user", "content": prompt}]
        )

        try:
            result = json.loads(response.content[0].text)
            return result
        except:
            return self._mock_code_response(response_text, code_frames)

    def _mock_code_response(
        self,
        response_text: str,
        code_frames: List[CodeFrame]
    ) -> Dict[str, Any]:
        """Mock coding for development"""

        response_lower = response_text.lower()
        codes = []

        # Simple keyword matching for mock coding
        for cf in code_frames:
            if cf.label.lower() in response_lower:
                codes.append(cf.code)
            elif any(keyword in response_lower for keyword in self._get_keywords(cf.label)):
                codes.append(cf.code)

        # If no codes matched, assign based on sentiment
        if not codes:
            if any(word in response_lower for word in ['good', 'great', 'love', 'bagus', 'suka']):
                codes = ["1"]  # Positive
            elif any(word in response_lower for word in ['bad', 'poor', 'hate', 'jelek', 'tidak']):
                codes = ["2"]  # Negative
            else:
                codes = ["99"]  # Other

        return {
            'codes': codes[:3],  # Max 3 codes
            'confidence': 0.75 if len(codes) <= 2 else 0.65
        }

    def _get_keywords(self, label: str) -> List[str]:
        """Get keywords for a label"""
        keyword_map = {
            'Quality': ['quality', 'good', 'bad', 'kualitas', 'bagus', 'jelek'],
            'Price': ['price', 'expensive', 'cheap', 'harga', 'mahal', 'murah'],
            'Service': ['service', 'staff', 'help', 'layanan', 'pelayanan'],
            'Features': ['feature', 'function', 'fitur', 'fungsi'],
            'Brand': ['brand', 'trust', 'reputation', 'merek', 'terpercaya']
        }

        for key, keywords in keyword_map.items():
            if key.lower() in label.lower():
                return keywords

        return []

    def _detect_language(self, text: str) -> str:
        """Detect language of text"""
        text_lower = text.lower()

        id_words = ['saya', 'anda', 'yang', 'untuk', 'ini', 'dengan']
        en_words = ['the', 'and', 'for', 'with', 'this', 'that']

        id_count = sum(1 for word in id_words if word in text_lower)
        en_count = sum(1 for word in en_words if word in text_lower)

        if id_count > en_count:
            return 'id'
        elif en_count > id_count:
            return 'en'
        else:
            return 'id-en'

    async def export_coded_data(
        self,
        question_id: str,
        format: str = 'csv'
    ) -> Any:
        """Export coded responses in various formats"""

        question = self.db.query(OpenEndQuestion).filter_by(id=question_id).first()
        if not question:
            raise ValueError("Question not found")

        responses = self.db.query(OpenEndResponse).filter_by(
            question_id=question_id
        ).all()

        code_frames = self.db.query(CodeFrame).filter_by(
            question_id=question_id
        ).all()

        if format == 'csv':
            return self._export_to_csv(question, responses, code_frames)
        elif format == 'spss':
            return self._export_to_spss(question, responses, code_frames)
        else:
            return self._export_to_json(question, responses, code_frames)

    def _export_to_csv(self, question, responses, code_frames):
        """Export to CSV format"""
        import csv
        import io

        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        headers = ['respondent_id', 'response_text']
        headers.extend([cf.code for cf in code_frames])
        writer.writerow(headers)

        # Data rows
        for response in responses:
            row = [response.respondent_id, response.response_text]
            for cf in code_frames:
                row.append(1 if cf.code in (response.codes or []) else 0)
            writer.writerow(row)

        return output.getvalue()

    def _export_to_spss(self, question, responses, code_frames):
        """Export to SPSS syntax format"""
        # Generate SPSS syntax for the coded data
        syntax = f"""* Open Ends Coding for {question.question_code}.
* Generated on {datetime.now().strftime('%Y-%m-%d %H:%M')}.

DATA LIST FREE /
  respondent_id (A20)
"""

        for cf in code_frames:
            syntax += f"  {question.question_code}_{cf.code.replace('.', '_')} (F1.0)\n"

        syntax += ".\nBEGIN DATA.\n"

        for response in responses:
            line = f"{response.respondent_id}"
            for cf in code_frames:
                line += f" {1 if cf.code in (response.codes or []) else 0}"
            syntax += line + "\n"

        syntax += "END DATA.\n\n"

        # Add value labels
        syntax += "VALUE LABELS\n"
        for cf in code_frames:
            var_name = f"{question.question_code}_{cf.code.replace('.', '_')}"
            syntax += f"  {var_name} 0 'Not mentioned' 1 '{cf.label}' /\n"

        syntax += ".\n"

        return syntax

    def _export_to_json(self, question, responses, code_frames):
        """Export to JSON format"""
        return {
            'question': {
                'code': question.question_code,
                'text': question.question_text,
                'wave': question.wave
            },
            'code_frame': [
                {
                    'code': cf.code,
                    'label': cf.label,
                    'description': cf.description,
                    'level': cf.level,
                    'usage_count': cf.usage_count
                }
                for cf in code_frames
            ],
            'responses': [
                {
                    'respondent_id': r.respondent_id,
                    'text': r.response_text,
                    'codes': r.codes or [],
                    'confidence': r.ai_confidence
                }
                for r in responses
            ],
            'statistics': {
                'total_responses': question.total_responses,
                'coded_responses': question.coded_responses,
                'completion_rate': (question.coded_responses / question.total_responses * 100)
                                  if question.total_responses > 0 else 0
            }
        }