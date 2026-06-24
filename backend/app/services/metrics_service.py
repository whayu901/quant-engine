"""
Phase 7: Metrics Service
Handles metric calculations and transformations for visualizations
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, distinct, case
import numpy as np
import json
import csv
import io
from collections import defaultdict
from ..models import Project, Transcript, Analysis, User
from ..models_phase7 import EngagementMetric, SentimentFlow


class MetricsService:
    """Service for calculating and transforming metrics"""

    async def calculate_speaker_metrics(
        self,
        project_id: str,
        metrics: List[str],
        group_by: str,
        include_demographics: bool,
        db: Session
    ) -> Dict[str, Any]:
        """Calculate comprehensive speaker metrics"""

        # For mock implementation
        speakers_data = self._generate_mock_speaker_metrics(metrics, group_by, include_demographics)

        # Real implementation would:
        # 1. Query transcript segments grouped by speaker
        # 2. Calculate requested metrics per speaker
        # 3. Group by specified dimension
        # 4. Include demographic data if requested

        return speakers_data

    async def apply_smoothing(
        self,
        data: Dict[str, Any],
        method: str,
        window_size: int
    ) -> Dict[str, Any]:
        """Apply smoothing to time series or flow data"""

        if method == "moving_avg":
            return self._apply_moving_average(data, window_size)
        elif method == "exponential":
            return self._apply_exponential_smoothing(data, window_size)
        else:
            return data

    async def apply_graph_layout(
        self,
        network_data: Dict[str, Any],
        algorithm: str
    ) -> Dict[str, Any]:
        """Apply layout algorithm to network graph"""

        nodes = network_data["nodes"]
        edges = network_data["edges"]

        if algorithm == "force":
            # Force-directed layout simulation
            positions = self._force_directed_layout(nodes, edges)
        elif algorithm == "circular":
            # Circular layout
            positions = self._circular_layout(nodes)
        elif algorithm == "hierarchical":
            # Hierarchical layout
            positions = self._hierarchical_layout(nodes, edges)
        else:
            # No layout, use random positions
            positions = self._random_layout(nodes)

        # Add positions to nodes
        for node in nodes:
            if node["id"] in positions:
                node["x"] = positions[node["id"]]["x"]
                node["y"] = positions[node["id"]]["y"]

        return network_data

    async def convert_to_csv(self, data: Dict[str, Any]) -> str:
        """Convert visualization data to CSV format"""

        output = io.StringIO()
        writer = None

        # Determine data structure and convert accordingly
        if "words" in data:  # Word cloud
            writer = csv.DictWriter(output, fieldnames=["text", "value", "language"])
            writer.writeheader()
            for word in data["words"]:
                writer.writerow({
                    "text": word["text"],
                    "value": word["value"],
                    "language": word.get("language", "")
                })

        elif "nodes" in data and "edges" in data:  # Network graph
            # Export nodes
            output.write("NODES\n")
            writer = csv.DictWriter(output, fieldnames=["id", "label", "size", "connections"])
            writer.writeheader()
            for node in data["nodes"]:
                writer.writerow(node)

            output.write("\nEDGES\n")
            writer = csv.DictWriter(output, fieldnames=["source", "target", "weight", "confidence"])
            writer.writeheader()
            for edge in data["edges"]:
                writer.writerow(edge)

        elif "matrix" in data:  # Heatmap
            # Write matrix with labels
            output.write(",")
            output.write(",".join(data.get("x_labels", [])))
            output.write("\n")

            for i, row in enumerate(data["matrix"]):
                if "y_labels" in data and i < len(data["y_labels"]):
                    output.write(f"{data['y_labels'][i]},")
                output.write(",".join(map(str, row)))
                output.write("\n")

        elif "series" in data:  # Timeline
            # Write time series data
            timestamps = data.get("timestamps", [])
            for metric_name, series_data in data["series"].items():
                output.write(f"Metric: {metric_name}\n")
                output.write("timestamp,value,count\n")
                for point in series_data:
                    output.write(f"{point['timestamp']},{point['value']},{point.get('count', '')}\n")
                output.write("\n")

        elif "locations" in data:  # Geographic
            writer = csv.DictWriter(output, fieldnames=[
                "country", "country_code", "region", "city",
                "latitude", "longitude", "value", "count"
            ])
            writer.writeheader()
            for location in data["locations"]:
                writer.writerow(location)

        elif "flow" in data:  # Sentiment flow
            writer = csv.DictWriter(output, fieldnames=[
                "position", "timestamp", "sentiment", "confidence", "speaker"
            ])
            writer.writeheader()
            for point in data["flow"]:
                writer.writerow(point)

        return output.getvalue()

    async def generate_image(
        self,
        data: Dict[str, Any],
        format: str
    ) -> str:
        """Generate image from visualization data (placeholder)"""

        # This would require matplotlib/plotly integration
        # For now, return a base64 encoded placeholder

        # Real implementation would:
        # 1. Use matplotlib or plotly to generate visualization
        # 2. Save to BytesIO buffer
        # 3. Convert to base64 for embedding or save to file

        if format == "png":
            # Would generate PNG image
            return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        elif format == "svg":
            # Would generate SVG
            return '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>'

        return ""

    # Helper methods for smoothing
    def _apply_moving_average(
        self,
        data: Dict[str, Any],
        window_size: int
    ) -> Dict[str, Any]:
        """Apply moving average smoothing"""

        if "flow" in data:
            # Smooth sentiment flow
            flow = data["flow"]
            smoothed_flow = []

            for i, point in enumerate(flow):
                start_idx = max(0, i - window_size // 2)
                end_idx = min(len(flow), i + window_size // 2 + 1)
                window = flow[start_idx:end_idx]

                smoothed_sentiment = np.mean([p["sentiment"] for p in window])

                smoothed_point = point.copy()
                smoothed_point["sentiment"] = smoothed_sentiment
                smoothed_point["smoothed"] = True
                smoothed_flow.append(smoothed_point)

            data["flow"] = smoothed_flow

        elif "series" in data:
            # Smooth time series
            for metric_name, series in data["series"].items():
                smoothed_series = []

                for i, point in enumerate(series):
                    start_idx = max(0, i - window_size // 2)
                    end_idx = min(len(series), i + window_size // 2 + 1)
                    window = series[start_idx:end_idx]

                    smoothed_value = np.mean([p["value"] for p in window])

                    smoothed_point = point.copy()
                    smoothed_point["value"] = smoothed_value
                    smoothed_point["smoothed"] = True
                    smoothed_series.append(smoothed_point)

                data["series"][metric_name] = smoothed_series

        return data

    def _apply_exponential_smoothing(
        self,
        data: Dict[str, Any],
        window_size: int
    ) -> Dict[str, Any]:
        """Apply exponential smoothing"""

        alpha = 2 / (window_size + 1)  # Smoothing factor

        if "flow" in data:
            flow = data["flow"]
            smoothed_flow = []

            for i, point in enumerate(flow):
                if i == 0:
                    smoothed_value = point["sentiment"]
                else:
                    smoothed_value = alpha * point["sentiment"] + (1 - alpha) * smoothed_flow[-1]["sentiment"]

                smoothed_point = point.copy()
                smoothed_point["sentiment"] = smoothed_value
                smoothed_point["smoothed"] = True
                smoothed_flow.append(smoothed_point)

            data["flow"] = smoothed_flow

        elif "series" in data:
            for metric_name, series in data["series"].items():
                smoothed_series = []

                for i, point in enumerate(series):
                    if i == 0:
                        smoothed_value = point["value"]
                    else:
                        smoothed_value = alpha * point["value"] + (1 - alpha) * smoothed_series[-1]["value"]

                    smoothed_point = point.copy()
                    smoothed_point["value"] = smoothed_value
                    smoothed_point["smoothed"] = True
                    smoothed_series.append(smoothed_point)

                data["series"][metric_name] = smoothed_series

        return data

    # Layout algorithms for network graphs
    def _force_directed_layout(
        self,
        nodes: List[Dict],
        edges: List[Dict]
    ) -> Dict[str, Dict[str, float]]:
        """Calculate force-directed layout positions"""

        # Simplified force-directed layout
        positions = {}
        n = len(nodes)

        # Initialize with random positions
        for i, node in enumerate(nodes):
            angle = 2 * np.pi * i / n
            positions[node["id"]] = {
                "x": np.cos(angle) * 100,
                "y": np.sin(angle) * 100
            }

        # Simulate forces (simplified)
        for _ in range(50):  # iterations
            forces = defaultdict(lambda: {"x": 0, "y": 0})

            # Repulsion between all nodes
            for i, node1 in enumerate(nodes):
                for node2 in nodes[i+1:]:
                    dx = positions[node2["id"]]["x"] - positions[node1["id"]]["x"]
                    dy = positions[node2["id"]]["y"] - positions[node1["id"]]["y"]
                    dist = max(1, np.sqrt(dx**2 + dy**2))

                    # Repulsion force
                    force = 1000 / (dist ** 2)
                    fx = -force * dx / dist
                    fy = -force * dy / dist

                    forces[node1["id"]]["x"] += fx
                    forces[node1["id"]]["y"] += fy
                    forces[node2["id"]]["x"] -= fx
                    forces[node2["id"]]["y"] -= fy

            # Attraction along edges
            for edge in edges:
                source = edge["source"]
                target = edge["target"]

                dx = positions[target]["x"] - positions[source]["x"]
                dy = positions[target]["y"] - positions[source]["y"]
                dist = np.sqrt(dx**2 + dy**2)

                # Attraction force
                force = dist * 0.01
                fx = force * dx / dist
                fy = force * dy / dist

                forces[source]["x"] += fx
                forces[source]["y"] += fy
                forces[target]["x"] -= fx
                forces[target]["y"] -= fy

            # Apply forces
            damping = 0.85
            for node_id in positions:
                positions[node_id]["x"] += forces[node_id]["x"] * damping
                positions[node_id]["y"] += forces[node_id]["y"] * damping

        return positions

    def _circular_layout(self, nodes: List[Dict]) -> Dict[str, Dict[str, float]]:
        """Calculate circular layout positions"""

        positions = {}
        n = len(nodes)
        radius = 100

        for i, node in enumerate(nodes):
            angle = 2 * np.pi * i / n
            positions[node["id"]] = {
                "x": radius * np.cos(angle),
                "y": radius * np.sin(angle)
            }

        return positions

    def _hierarchical_layout(
        self,
        nodes: List[Dict],
        edges: List[Dict]
    ) -> Dict[str, Dict[str, float]]:
        """Calculate hierarchical layout positions"""

        # Build adjacency list
        adjacency = defaultdict(list)
        in_degree = defaultdict(int)

        for edge in edges:
            adjacency[edge["source"]].append(edge["target"])
            in_degree[edge["target"]] += 1

        # Find roots (nodes with no incoming edges)
        roots = [node["id"] for node in nodes if in_degree[node["id"]] == 0]

        # BFS to assign levels
        levels = {}
        level = 0
        current = roots.copy()

        while current:
            next_level = []
            for node_id in current:
                levels[node_id] = level
                for child in adjacency[node_id]:
                    if child not in levels:
                        next_level.append(child)
            current = list(set(next_level))
            level += 1

        # Assign nodes without level to bottom
        for node in nodes:
            if node["id"] not in levels:
                levels[node["id"]] = level

        # Calculate positions
        positions = {}
        level_counts = defaultdict(int)
        level_indices = defaultdict(int)

        # Count nodes per level
        for node_id, lvl in levels.items():
            level_counts[lvl] += 1

        # Assign positions
        for node in nodes:
            lvl = levels.get(node["id"], 0)
            idx = level_indices[lvl]
            level_indices[lvl] += 1

            x = (idx - level_counts[lvl] / 2) * 50
            y = lvl * 50

            positions[node["id"]] = {"x": x, "y": y}

        return positions

    def _random_layout(self, nodes: List[Dict]) -> Dict[str, Dict[str, float]]:
        """Generate random layout positions"""

        positions = {}
        for node in nodes:
            positions[node["id"]] = {
                "x": np.random.uniform(-100, 100),
                "y": np.random.uniform(-100, 100)
            }

        return positions

    # Mock data generation
    def _generate_mock_speaker_metrics(
        self,
        metrics: List[str],
        group_by: str,
        include_demographics: bool
    ) -> Dict[str, Any]:
        """Generate mock speaker metrics"""

        speakers = [
            {
                "id": "s1",
                "name": "John Doe",
                "role": "Moderator",
                "department": "Research"
            },
            {
                "id": "s2",
                "name": "Jane Smith",
                "role": "Participant",
                "department": "Customer"
            },
            {
                "id": "s3",
                "name": "Bob Johnson",
                "role": "Participant",
                "department": "Customer"
            },
            {
                "id": "s4",
                "name": "Alice Brown",
                "role": "Observer",
                "department": "Product"
            }
        ]

        # Add demographics if requested
        if include_demographics:
            for speaker in speakers:
                speaker["age_group"] = np.random.choice(["18-25", "26-35", "36-45", "46+"])
                speaker["gender"] = np.random.choice(["Male", "Female", "Other"])
                speaker["location"] = np.random.choice(["Singapore", "Jakarta", "KL", "Bangkok"])

        # Calculate metrics
        metrics_data = {}

        for metric in metrics:
            if metric == "speaking_time":
                metrics_data["speaking_time"] = {
                    speaker["id"]: np.random.randint(60, 600)  # seconds
                    for speaker in speakers
                }
            elif metric == "word_count":
                metrics_data["word_count"] = {
                    speaker["id"]: np.random.randint(100, 1000)
                    for speaker in speakers
                }
            elif metric == "sentiment":
                metrics_data["sentiment"] = {
                    speaker["id"]: np.random.uniform(-0.5, 0.8)
                    for speaker in speakers
                }
            elif metric == "interruptions":
                metrics_data["interruptions"] = {
                    speaker["id"]: np.random.randint(0, 10)
                    for speaker in speakers
                }
            elif metric == "questions_asked":
                metrics_data["questions_asked"] = {
                    speaker["id"]: np.random.randint(0, 20)
                    for speaker in speakers
                }

        # Group by specified dimension
        if group_by == "role":
            # Group speakers by role
            grouped = defaultdict(list)
            for speaker in speakers:
                grouped[speaker["role"]].append(speaker)

            # Aggregate metrics by group
            grouped_metrics = {}
            for role, group_speakers in grouped.items():
                grouped_metrics[role] = {}
                for metric_name, metric_values in metrics_data.items():
                    values = [
                        metric_values.get(s["id"], 0)
                        for s in group_speakers
                    ]
                    grouped_metrics[role][metric_name] = {
                        "mean": np.mean(values),
                        "sum": np.sum(values),
                        "min": np.min(values),
                        "max": np.max(values)
                    }

            return {
                "speakers": list(grouped.keys()),
                "metrics": grouped_metrics
            }

        return {
            "speakers": speakers,
            "metrics": metrics_data
        }