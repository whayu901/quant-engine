"""
Phase 7: Aggregation Service
Handles data aggregation for visualizations
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, distinct, case
from collections import Counter, defaultdict
import numpy as np
from ..models import Project, Transcript, Analysis
from ..models_phase7 import (
    WordFrequency, ThemeCooccurrence, TimeSeriesMetric,
    GeographicMetric, SentimentFlow, AggregationPeriod
)


class AggregationService:
    """Service for aggregating data for visualizations"""

    async def generate_word_cloud(
        self,
        project_id: str,
        language: Optional[str],
        max_words: int,
        exclude_stopwords: bool,
        time_range: Optional[str],
        theme_id: Optional[str],
        db: Session
    ) -> Dict[str, Any]:
        """Generate word cloud data"""

        # Build query for word frequencies
        query = db.query(WordFrequency).filter(
            WordFrequency.project_id == project_id
        )

        # Apply filters
        if language:
            query = query.filter(WordFrequency.language == language)

        if exclude_stopwords:
            query = query.filter(WordFrequency.is_stopword == False)

        if theme_id:
            # Filter words associated with specific theme
            query = query.filter(
                func.jsonb_extract_path_text(
                    WordFrequency.theme_associations,
                    theme_id
                ).isnot(None)
            )

        # Apply time range filter
        if time_range:
            start_date = self._calculate_start_date(time_range)
            if start_date:
                query = query.filter(WordFrequency.period_start >= start_date)

        # Order by frequency and limit
        words = query.order_by(WordFrequency.frequency.desc()).limit(max_words).all()

        # Check for existing data
        if not words:
            # Generate mock data for testing
            words = self._generate_mock_word_cloud_data(max_words)
            return {
                "words": words,
                "total_words": len(words),
                "languages": ["en", "id"] if not language else [language],
                "code_mixing": True if not language else False
            }

        # Format response
        word_data = []
        languages_detected = set()

        for word in words:
            word_data.append({
                "text": word.word,
                "value": word.frequency,
                "sentiment": word.avg_sentiment,
                "language": word.language,
                "tf_idf": word.tf_idf_score
            })
            languages_detected.add(word.language)

        # Detect code-mixing (multiple languages)
        code_mixing = len(languages_detected) > 1

        return {
            "words": word_data,
            "total_words": len(word_data),
            "languages": list(languages_detected),
            "code_mixing": code_mixing
        }

    async def generate_network_graph(
        self,
        project_id: str,
        min_cooccurrence: int,
        max_nodes: int,
        confidence_threshold: float,
        db: Session
    ) -> Dict[str, Any]:
        """Generate network graph of theme co-occurrences"""

        # Query theme co-occurrences
        cooccurrences = db.query(ThemeCooccurrence).filter(
            ThemeCooccurrence.project_id == project_id,
            ThemeCooccurrence.cooccurrence_count >= min_cooccurrence,
            ThemeCooccurrence.confidence_score >= confidence_threshold
        ).order_by(
            ThemeCooccurrence.cooccurrence_count.desc()
        ).limit(max_nodes * 2).all()  # Get more edges than nodes

        if not cooccurrences:
            # Generate mock data
            return self._generate_mock_network_graph(max_nodes)

        # Build nodes and edges
        nodes = {}
        edges = []

        for cooc in cooccurrences:
            # Add nodes
            if cooc.theme_a_id not in nodes:
                nodes[cooc.theme_a_id] = {
                    "id": cooc.theme_a_id,
                    "label": cooc.theme_a_name,
                    "size": 0,
                    "connections": 0
                }

            if cooc.theme_b_id not in nodes:
                nodes[cooc.theme_b_id] = {
                    "id": cooc.theme_b_id,
                    "label": cooc.theme_b_name,
                    "size": 0,
                    "connections": 0
                }

            # Update node sizes based on connections
            nodes[cooc.theme_a_id]["size"] += cooc.cooccurrence_count
            nodes[cooc.theme_b_id]["size"] += cooc.cooccurrence_count
            nodes[cooc.theme_a_id]["connections"] += 1
            nodes[cooc.theme_b_id]["connections"] += 1

            # Add edge
            edges.append({
                "source": cooc.theme_a_id,
                "target": cooc.theme_b_id,
                "weight": cooc.cooccurrence_count,
                "confidence": cooc.confidence_score,
                "correlation": cooc.correlation
            })

            # Limit nodes
            if len(nodes) >= max_nodes:
                break

        # Normalize node sizes
        if nodes:
            max_size = max(n["size"] for n in nodes.values())
            for node in nodes.values():
                node["size"] = (node["size"] / max_size) * 100

        return {
            "nodes": list(nodes.values())[:max_nodes],
            "edges": edges,
            "total_themes": len(nodes),
            "total_edges": len(edges)
        }

    async def generate_heatmap(
        self,
        project_id: str,
        metric: str,
        x_axis: str,
        y_axis: str,
        aggregation: str,
        normalize: bool,
        db: Session
    ) -> Dict[str, Any]:
        """Generate heatmap data"""

        # For mock implementation
        if metric == "sentiment":
            return self._generate_mock_heatmap(x_axis, y_axis)

        # Real implementation would query based on metric type
        # This is a simplified example
        matrix = []
        x_labels = []
        y_labels = []

        if metric == "engagement":
            # Query engagement metrics
            # Group by x_axis and y_axis dimensions
            pass
        elif metric == "themes":
            # Query theme distributions
            pass

        # Apply aggregation
        if aggregation == "mean":
            # Calculate mean values
            pass
        elif aggregation == "sum":
            # Calculate sum
            pass

        # Normalize if requested
        if normalize:
            matrix = self._normalize_matrix(matrix)

        return {
            "matrix": matrix,
            "x_labels": x_labels,
            "y_labels": y_labels,
            "value_range": {"min": 0, "max": 1} if normalize else self._get_value_range(matrix)
        }

    async def generate_timeline(
        self,
        project_id: str,
        metrics: List[str],
        period: AggregationPeriod,
        start_date: datetime,
        end_date: datetime,
        db: Session
    ) -> Dict[str, Any]:
        """Generate timeline data for multiple metrics"""

        # Query time series metrics
        query = db.query(TimeSeriesMetric).filter(
            TimeSeriesMetric.project_id == project_id,
            TimeSeriesMetric.period_type == period,
            TimeSeriesMetric.period_start >= start_date,
            TimeSeriesMetric.period_end <= end_date,
            TimeSeriesMetric.metric_name.in_(metrics)
        ).order_by(TimeSeriesMetric.period_start)

        time_series_data = query.all()

        if not time_series_data:
            # Generate mock timeline
            return self._generate_mock_timeline(metrics, start_date, end_date, period)

        # Organize data by metric and time
        series = {metric: [] for metric in metrics}
        timestamps = set()

        for data_point in time_series_data:
            timestamps.add(data_point.period_start.isoformat())
            series[data_point.metric_name].append({
                "timestamp": data_point.period_start.isoformat(),
                "value": data_point.value,
                "count": data_point.count,
                "min": data_point.min_value,
                "max": data_point.max_value,
                "avg": data_point.avg_value
            })

        return {
            "series": series,
            "timestamps": sorted(list(timestamps))
        }

    async def generate_geographic_data(
        self,
        project_id: str,
        metric: str,
        region: str,
        resolution: str,
        normalize_population: bool,
        db: Session
    ) -> Dict[str, Any]:
        """Generate geographic visualization data"""

        # Query geographic metrics
        query = db.query(GeographicMetric).filter(
            GeographicMetric.project_id == project_id,
            GeographicMetric.metric_name == metric
        )

        # Filter by region
        if region != "sea":
            # Map region to country codes
            country_mapping = {
                "singapore": "SG",
                "indonesia": "ID",
                "malaysia": "MY",
                "thailand": "TH",
                "vietnam": "VN",
                "philippines": "PH"
            }
            if region in country_mapping:
                query = query.filter(GeographicMetric.country_code == country_mapping[region])

        geo_data = query.all()

        if not geo_data:
            # Generate mock geographic data
            return self._generate_mock_geographic_data(region, metric)

        # Format location data
        locations = []
        bounds = {"min_lat": 90, "max_lat": -90, "min_lng": 180, "max_lng": -180}
        values = []

        for location in geo_data:
            value = location.value_per_capita if normalize_population else location.value

            locations.append({
                "country": location.country_name,
                "country_code": location.country_code,
                "region": location.region,
                "city": location.city,
                "latitude": location.latitude,
                "longitude": location.longitude,
                "value": value,
                "count": location.count,
                "metadata": location.metadata
            })

            values.append(value)

            # Update bounds
            if location.latitude:
                bounds["min_lat"] = min(bounds["min_lat"], location.latitude)
                bounds["max_lat"] = max(bounds["max_lat"], location.latitude)
            if location.longitude:
                bounds["min_lng"] = min(bounds["min_lng"], location.longitude)
                bounds["max_lng"] = max(bounds["max_lng"], location.longitude)

        return {
            "locations": locations,
            "bounds": bounds,
            "value_range": {"min": min(values), "max": max(values)} if values else {"min": 0, "max": 0}
        }

    async def generate_sentiment_flow(
        self,
        project_id: str,
        transcript_id: Optional[str],
        resolution: int,
        include_emotions: bool,
        db: Session
    ) -> Dict[str, Any]:
        """Generate sentiment flow visualization data"""

        # Query sentiment flow data
        query = db.query(SentimentFlow).filter(
            SentimentFlow.project_id == project_id
        )

        if transcript_id:
            query = query.filter(SentimentFlow.transcript_id == transcript_id)

        flow_data = query.order_by(SentimentFlow.position).all()

        if not flow_data:
            # Generate mock sentiment flow
            return self._generate_mock_sentiment_flow(resolution, include_emotions)

        # Resample to desired resolution
        flow_points = []
        speakers = set()

        # Group by position buckets
        bucket_size = max(1, len(flow_data) // resolution)

        for i in range(0, len(flow_data), bucket_size):
            bucket = flow_data[i:i+bucket_size]

            # Average sentiment in bucket
            avg_sentiment = np.mean([f.sentiment_score for f in bucket])

            flow_point = {
                "position": i // bucket_size,
                "timestamp": bucket[0].timestamp,
                "sentiment": avg_sentiment,
                "confidence": np.mean([f.confidence for f in bucket if f.confidence]),
                "speaker": bucket[0].speaker_name
            }

            if include_emotions and bucket[0].emotions:
                flow_point["emotions"] = bucket[0].emotions

            flow_points.append(flow_point)

            if bucket[0].speaker_name:
                speakers.add(bucket[0].speaker_name)

        # Count transcripts
        transcript_count = db.query(func.count(distinct(SentimentFlow.transcript_id))).filter(
            SentimentFlow.project_id == project_id
        ).scalar()

        return {
            "flow": flow_points,
            "speakers": list(speakers),
            "transcript_count": transcript_count
        }

    async def generate_theme_river(
        self,
        project_id: str,
        max_themes: int,
        period: AggregationPeriod,
        stacked: bool,
        normalize: bool,
        db: Session
    ) -> Dict[str, Any]:
        """Generate theme river (stream graph) data"""

        # This would query time series data grouped by themes
        # For now, return mock data
        return self._generate_mock_theme_river(max_themes, period)

    async def get_visualization_data(
        self,
        project_id: str,
        visualization_type: str,
        config: Optional[str],
        db: Session
    ) -> Dict[str, Any]:
        """Get visualization data for export"""

        # Route to appropriate generator based on type
        if visualization_type == "word_cloud":
            return await self.generate_word_cloud(
                project_id, None, 100, True, None, None, db
            )
        elif visualization_type == "network_graph":
            return await self.generate_network_graph(
                project_id, 2, 50, 0.5, db
            )
        # Add other visualization types...

        return {}

    # Helper methods
    def _calculate_start_date(self, time_range: str) -> Optional[datetime]:
        """Calculate start date from time range string"""
        if not time_range:
            return None

        now = datetime.utcnow()

        if time_range == "7d":
            return now - timedelta(days=7)
        elif time_range == "30d":
            return now - timedelta(days=30)
        elif time_range == "90d":
            return now - timedelta(days=90)
        elif time_range == "all":
            return None

        return None

    def _normalize_matrix(self, matrix: List[List[float]]) -> List[List[float]]:
        """Normalize matrix values to 0-1 range"""
        if not matrix:
            return matrix

        flat = [val for row in matrix for val in row]
        min_val = min(flat)
        max_val = max(flat)

        if max_val == min_val:
            return [[0.5 for _ in row] for row in matrix]

        return [
            [(val - min_val) / (max_val - min_val) for val in row]
            for row in matrix
        ]

    def _get_value_range(self, matrix: List[List[float]]) -> Dict[str, float]:
        """Get min and max values from matrix"""
        if not matrix:
            return {"min": 0, "max": 0}

        flat = [val for row in matrix for val in row]
        return {"min": min(flat), "max": max(flat)}

    # Mock data generators
    def _generate_mock_word_cloud_data(self, max_words: int) -> List[Dict]:
        """Generate mock word cloud data"""
        # Common SEA terms with code-mixing
        words = [
            {"text": "customer", "value": 150, "language": "en"},
            {"text": "pelanggan", "value": 140, "language": "id"},  # customer in Indonesian
            {"text": "service", "value": 120, "language": "en"},
            {"text": "quality", "value": 110, "language": "en"},
            {"text": "bagus", "value": 100, "language": "id"},  # good in Indonesian
            {"text": "product", "value": 95, "language": "en"},
            {"text": "harga", "value": 90, "language": "id"},  # price in Indonesian
            {"text": "experience", "value": 85, "language": "en"},
            {"text": "satisfied", "value": 80, "language": "en"},
            {"text": "senang", "value": 75, "language": "ms"},  # happy in Malay
            {"text": "improve", "value": 70, "language": "en"},
            {"text": "mudah", "value": 65, "language": "id"},  # easy in Indonesian
            {"text": "recommend", "value": 60, "language": "en"},
            {"text": "cepat", "value": 55, "language": "id"},  # fast in Indonesian
            {"text": "friendly", "value": 50, "language": "en"}
        ]

        return words[:max_words]

    def _generate_mock_network_graph(self, max_nodes: int) -> Dict:
        """Generate mock network graph"""
        nodes = [
            {"id": "t1", "label": "Customer Service", "size": 100, "connections": 4},
            {"id": "t2", "label": "Product Quality", "size": 85, "connections": 3},
            {"id": "t3", "label": "Price Value", "size": 70, "connections": 3},
            {"id": "t4", "label": "User Experience", "size": 65, "connections": 2},
            {"id": "t5", "label": "Brand Trust", "size": 60, "connections": 2}
        ]

        edges = [
            {"source": "t1", "target": "t2", "weight": 15, "confidence": 0.85},
            {"source": "t1", "target": "t4", "weight": 12, "confidence": 0.75},
            {"source": "t2", "target": "t3", "weight": 10, "confidence": 0.70},
            {"source": "t3", "target": "t5", "weight": 8, "confidence": 0.65},
            {"source": "t4", "target": "t5", "weight": 7, "confidence": 0.60}
        ]

        return {
            "nodes": nodes[:max_nodes],
            "edges": edges,
            "total_themes": len(nodes),
            "total_edges": len(edges)
        }

    def _generate_mock_heatmap(self, x_axis: str, y_axis: str) -> Dict:
        """Generate mock heatmap data"""
        x_labels = ["Speaker 1", "Speaker 2", "Speaker 3", "Speaker 4"]
        y_labels = ["Theme A", "Theme B", "Theme C", "Theme D", "Theme E"]

        # Random matrix
        matrix = [
            [0.8, 0.3, 0.6, 0.4],
            [0.2, 0.9, 0.4, 0.5],
            [0.5, 0.4, 0.7, 0.3],
            [0.3, 0.6, 0.5, 0.8],
            [0.7, 0.2, 0.3, 0.6]
        ]

        return {
            "matrix": matrix,
            "x_labels": x_labels,
            "y_labels": y_labels,
            "value_range": {"min": 0.2, "max": 0.9}
        }

    def _generate_mock_timeline(
        self,
        metrics: List[str],
        start_date: datetime,
        end_date: datetime,
        period: AggregationPeriod
    ) -> Dict:
        """Generate mock timeline data"""
        # Generate timestamps
        timestamps = []
        current = start_date

        if period == AggregationPeriod.DAILY:
            delta = timedelta(days=1)
        elif period == AggregationPeriod.WEEKLY:
            delta = timedelta(weeks=1)
        else:
            delta = timedelta(days=1)

        while current <= end_date:
            timestamps.append(current.isoformat())
            current += delta

        # Generate series data
        series = {}
        for metric in metrics:
            series[metric] = []
            for ts in timestamps:
                # Random walk
                base = 0.5
                value = base + np.random.randn() * 0.1
                series[metric].append({
                    "timestamp": ts,
                    "value": max(0, min(1, value)),
                    "count": np.random.randint(10, 100)
                })

        return {
            "series": series,
            "timestamps": timestamps
        }

    def _generate_mock_geographic_data(self, region: str, metric: str) -> Dict:
        """Generate mock geographic data"""
        # SEA locations
        locations = [
            {
                "country": "Singapore",
                "country_code": "SG",
                "latitude": 1.3521,
                "longitude": 103.8198,
                "value": 85
            },
            {
                "country": "Indonesia",
                "country_code": "ID",
                "region": "Jakarta",
                "latitude": -6.2088,
                "longitude": 106.8456,
                "value": 72
            },
            {
                "country": "Malaysia",
                "country_code": "MY",
                "region": "Kuala Lumpur",
                "latitude": 3.1390,
                "longitude": 101.6869,
                "value": 78
            },
            {
                "country": "Thailand",
                "country_code": "TH",
                "region": "Bangkok",
                "latitude": 13.7563,
                "longitude": 100.5018,
                "value": 70
            },
            {
                "country": "Vietnam",
                "country_code": "VN",
                "region": "Ho Chi Minh City",
                "latitude": 10.8231,
                "longitude": 106.6297,
                "value": 68
            },
            {
                "country": "Philippines",
                "country_code": "PH",
                "region": "Manila",
                "latitude": 14.5995,
                "longitude": 120.9842,
                "value": 65
            }
        ]

        # Filter by region if specified
        if region != "sea":
            locations = [l for l in locations if l["country"].lower() == region]

        # Add metadata
        for loc in locations:
            loc["count"] = np.random.randint(100, 1000)
            loc["metadata"] = {"population": np.random.randint(100000, 10000000)}

        bounds = {
            "min_lat": -10,
            "max_lat": 20,
            "min_lng": 95,
            "max_lng": 125
        }

        return {
            "locations": locations,
            "bounds": bounds,
            "value_range": {"min": 65, "max": 85}
        }

    def _generate_mock_sentiment_flow(self, resolution: int, include_emotions: bool) -> Dict:
        """Generate mock sentiment flow data"""
        flow = []

        for i in range(resolution):
            sentiment = np.sin(i * 0.1) * 0.5  # Oscillating sentiment

            point = {
                "position": i,
                "timestamp": i * 10,  # 10 seconds per position
                "sentiment": sentiment,
                "confidence": 0.8 + np.random.rand() * 0.2,
                "speaker": f"Speaker {(i % 3) + 1}"
            }

            if include_emotions:
                point["emotions"] = {
                    "joy": max(0, sentiment) * 0.8,
                    "sadness": max(0, -sentiment) * 0.7,
                    "neutral": 0.3
                }

            flow.append(point)

        return {
            "flow": flow,
            "speakers": ["Speaker 1", "Speaker 2", "Speaker 3"],
            "transcript_count": 5
        }

    def _generate_mock_theme_river(self, max_themes: int, period: AggregationPeriod) -> Dict:
        """Generate mock theme river data"""
        themes = [f"Theme {i+1}" for i in range(max_themes)]

        # Generate timestamps (30 data points)
        timestamps = []
        for i in range(30):
            timestamps.append(
                (datetime.utcnow() - timedelta(days=30-i)).isoformat()
            )

        # Generate values for each theme at each timestamp
        values = []
        for theme in themes:
            theme_values = []
            base = np.random.rand() * 50
            for _ in timestamps:
                # Random walk with trend
                base += np.random.randn() * 5
                theme_values.append(max(0, base))
            values.append(theme_values)

        return {
            "themes": themes,
            "timestamps": timestamps,
            "values": values
        }