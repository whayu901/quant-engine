"""
Statistical Analysis Module for Phase 4
Provides advanced statistical analysis for qualitative data coding
Competitive advantage features for SEA market
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from collections import Counter
from scipy import stats
from sklearn.metrics import cohen_kappa_score, confusion_matrix
import json
import logging

logger = logging.getLogger(__name__)


class StatisticalAnalyzer:
    """Advanced statistical analysis for qualitative research"""

    @staticmethod
    def calculate_inter_rater_reliability(
        rater1_codes: List[str],
        rater2_codes: List[str]
    ) -> Dict[str, Any]:
        """
        Calculate Cohen's Kappa for inter-rater reliability
        Critical for academic and enterprise research validity
        """
        if len(rater1_codes) != len(rater2_codes):
            raise ValueError("Rater codes must have same length")

        # Calculate Cohen's Kappa
        kappa = cohen_kappa_score(rater1_codes, rater2_codes)

        # Calculate percentage agreement
        agreement = sum(1 for a, b in zip(rater1_codes, rater2_codes) if a == b)
        percent_agreement = (agreement / len(rater1_codes)) * 100

        # Generate confusion matrix
        labels = sorted(set(rater1_codes + rater2_codes))
        cm = confusion_matrix(rater1_codes, rater2_codes, labels=labels)

        # Interpret Kappa value
        if kappa < 0:
            interpretation = "Poor (less than chance agreement)"
        elif kappa <= 0.20:
            interpretation = "Slight agreement"
        elif kappa <= 0.40:
            interpretation = "Fair agreement"
        elif kappa <= 0.60:
            interpretation = "Moderate agreement"
        elif kappa <= 0.80:
            interpretation = "Substantial agreement"
        else:
            interpretation = "Almost perfect agreement"

        return {
            "kappa": float(kappa),
            "interpretation": interpretation,
            "percent_agreement": float(percent_agreement),
            "confusion_matrix": cm.tolist(),
            "labels": labels,
            "n_samples": len(rater1_codes)
        }

    @staticmethod
    def calculate_code_frequency(codes: List[str]) -> Dict[str, Any]:
        """Calculate code frequency distribution with statistics"""
        freq = Counter(codes)
        total = len(codes)

        # Calculate percentages
        freq_dist = {
            code: {
                "count": count,
                "percentage": (count / total) * 100,
                "rank": rank + 1
            }
            for rank, (code, count) in enumerate(freq.most_common())
        }

        # Calculate entropy (diversity measure)
        probs = [count / total for count in freq.values()]
        entropy = -sum(p * np.log2(p) if p > 0 else 0 for p in probs)

        # Calculate Simpson's diversity index
        simpson = 1 - sum((count / total) ** 2 for count in freq.values())

        return {
            "frequency_distribution": freq_dist,
            "total_codes": total,
            "unique_codes": len(freq),
            "entropy": float(entropy),
            "simpson_diversity": float(simpson),
            "most_common": freq.most_common(10)
        }

    @staticmethod
    def calculate_code_co_occurrence(
        segments: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate code co-occurrence matrix
        Shows which codes appear together frequently
        """
        # Extract all unique codes
        all_codes = set()
        for segment in segments:
            if "codes" in segment:
                all_codes.update(segment["codes"])

        codes_list = sorted(all_codes)
        n_codes = len(codes_list)

        # Initialize co-occurrence matrix
        co_matrix = np.zeros((n_codes, n_codes))

        # Count co-occurrences
        for segment in segments:
            segment_codes = segment.get("codes", [])
            for i, code1 in enumerate(codes_list):
                if code1 in segment_codes:
                    for j, code2 in enumerate(codes_list):
                        if code2 in segment_codes:
                            co_matrix[i, j] += 1

        # Calculate Jaccard similarity
        jaccard_matrix = np.zeros((n_codes, n_codes))
        for i in range(n_codes):
            for j in range(n_codes):
                if i == j:
                    jaccard_matrix[i, j] = 1.0
                else:
                    union = co_matrix[i, i] + co_matrix[j, j] - co_matrix[i, j]
                    if union > 0:
                        jaccard_matrix[i, j] = co_matrix[i, j] / union

        return {
            "codes": codes_list,
            "co_occurrence_matrix": co_matrix.tolist(),
            "jaccard_similarity": jaccard_matrix.tolist(),
            "n_codes": n_codes,
            "n_segments": len(segments)
        }

    @staticmethod
    def detect_code_mixing(
        text: str,
        languages: List[str] = ["en", "id", "ms", "tl", "th", "vi"]
    ) -> Dict[str, Any]:
        """
        Detect code-mixing in text (critical for SEA markets)
        Identifies language switching within sentences
        """
        # Simple heuristic-based detection
        # In production, use language detection libraries

        # Common words/patterns for SEA languages
        language_markers = {
            "id": ["saya", "anda", "tidak", "dengan", "untuk", "yang", "dan", "atau"],
            "ms": ["saya", "awak", "tidak", "dengan", "untuk", "yang", "dan", "atau"],
            "tl": ["ako", "ikaw", "hindi", "sa", "para", "ang", "at", "o"],
            "th": ["ฉัน", "คุณ", "ไม่", "กับ", "สำหรับ", "ที่", "และ", "หรือ"],
            "vi": ["tôi", "bạn", "không", "với", "cho", "mà", "và", "hoặc"],
            "en": ["i", "you", "not", "with", "for", "that", "and", "or"]
        }

        words = text.lower().split()
        detected_languages = Counter()

        for word in words:
            for lang, markers in language_markers.items():
                if word in markers:
                    detected_languages[lang] += 1

        total_markers = sum(detected_languages.values())

        if total_markers == 0:
            return {
                "has_code_mixing": False,
                "languages_detected": [],
                "mixing_ratio": 0.0
            }

        # Calculate mixing ratio
        primary_lang_count = max(detected_languages.values())
        mixing_ratio = 1.0 - (primary_lang_count / total_markers) if total_markers > 0 else 0

        return {
            "has_code_mixing": len(detected_languages) > 1,
            "languages_detected": list(detected_languages.keys()),
            "language_distribution": dict(detected_languages),
            "mixing_ratio": float(mixing_ratio),
            "primary_language": max(detected_languages, key=detected_languages.get)
        }

    @staticmethod
    def calculate_sentiment_statistics(
        sentiments: List[float]
    ) -> Dict[str, Any]:
        """Calculate statistical measures for sentiment scores"""
        if not sentiments:
            return {
                "mean": 0,
                "median": 0,
                "std": 0,
                "distribution": {}
            }

        sentiments_array = np.array(sentiments)

        # Basic statistics
        mean_sentiment = np.mean(sentiments_array)
        median_sentiment = np.median(sentiments_array)
        std_sentiment = np.std(sentiments_array)

        # Distribution
        bins = [-1.0, -0.6, -0.2, 0.2, 0.6, 1.0]
        labels = ["Very Negative", "Negative", "Neutral", "Positive", "Very Positive"]
        hist, _ = np.histogram(sentiments_array, bins=bins)

        distribution = {
            label: int(count) for label, count in zip(labels, hist)
        }

        # Percentiles
        percentiles = np.percentile(sentiments_array, [25, 50, 75])

        return {
            "mean": float(mean_sentiment),
            "median": float(median_sentiment),
            "std": float(std_sentiment),
            "min": float(np.min(sentiments_array)),
            "max": float(np.max(sentiments_array)),
            "distribution": distribution,
            "percentiles": {
                "q1": float(percentiles[0]),
                "q2": float(percentiles[1]),
                "q3": float(percentiles[2])
            },
            "n_samples": len(sentiments)
        }

    @staticmethod
    def calculate_concept_testing_metrics(
        responses: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Calculate concept testing metrics for product research
        Essential for enterprise clients in SEA
        """
        # Extract metrics
        appeal_scores = []
        uniqueness_scores = []
        purchase_intent = []
        price_perception = []

        for response in responses:
            if "appeal" in response:
                appeal_scores.append(response["appeal"])
            if "uniqueness" in response:
                uniqueness_scores.append(response["uniqueness"])
            if "purchase_intent" in response:
                purchase_intent.append(response["purchase_intent"])
            if "price_perception" in response:
                price_perception.append(response["price_perception"])

        # Calculate top-2 box scores (critical metric)
        def top_2_box(scores, scale_max=5):
            if not scores:
                return 0
            top_2 = sum(1 for s in scores if s >= scale_max - 1)
            return (top_2 / len(scores)) * 100

        # Calculate Net Promoter Score (NPS) style metric
        def calculate_nps(scores, scale_max=10):
            if not scores:
                return 0
            promoters = sum(1 for s in scores if s >= 9)
            detractors = sum(1 for s in scores if s <= 6)
            return ((promoters - detractors) / len(scores)) * 100

        return {
            "appeal": {
                "mean": float(np.mean(appeal_scores)) if appeal_scores else 0,
                "top_2_box": top_2_box(appeal_scores),
                "distribution": Counter(appeal_scores)
            },
            "uniqueness": {
                "mean": float(np.mean(uniqueness_scores)) if uniqueness_scores else 0,
                "top_2_box": top_2_box(uniqueness_scores),
                "distribution": Counter(uniqueness_scores)
            },
            "purchase_intent": {
                "mean": float(np.mean(purchase_intent)) if purchase_intent else 0,
                "top_2_box": top_2_box(purchase_intent),
                "definitely_would_buy": sum(1 for s in purchase_intent if s == 5) / len(purchase_intent) * 100 if purchase_intent else 0
            },
            "price_perception": {
                "too_expensive": sum(1 for p in price_perception if p == "too_expensive") / len(price_perception) * 100 if price_perception else 0,
                "about_right": sum(1 for p in price_perception if p == "about_right") / len(price_perception) * 100 if price_perception else 0,
                "good_value": sum(1 for p in price_perception if p == "good_value") / len(price_perception) * 100 if price_perception else 0
            },
            "sample_size": len(responses),
            "recommendation": calculate_nps(appeal_scores) if appeal_scores else 0
        }

    @staticmethod
    def calculate_theme_emergence(
        segments: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Track theme emergence over time
        Shows when themes saturate (no new themes emerging)
        """
        themes_by_segment = []
        cumulative_themes = set()
        emergence_points = {}

        for i, segment in enumerate(segments):
            segment_themes = set(segment.get("themes", []))
            new_themes = segment_themes - cumulative_themes

            for theme in new_themes:
                emergence_points[theme] = i + 1

            cumulative_themes.update(segment_themes)
            themes_by_segment.append(len(cumulative_themes))

        # Calculate saturation point (where new theme rate drops below threshold)
        saturation_point = None
        if len(themes_by_segment) > 10:
            for i in range(10, len(themes_by_segment)):
                window = themes_by_segment[i-10:i]
                growth_rate = (window[-1] - window[0]) / 10
                if growth_rate < 0.1:  # Less than 0.1 new themes per segment
                    saturation_point = i
                    break

        return {
            "total_themes": len(cumulative_themes),
            "emergence_curve": themes_by_segment,
            "emergence_points": emergence_points,
            "saturation_point": saturation_point,
            "saturation_reached": saturation_point is not None,
            "n_segments": len(segments)
        }

    @staticmethod
    def calculate_response_quality_metrics(
        responses: List[str]
    ) -> Dict[str, Any]:
        """
        Calculate response quality metrics
        Identifies low-quality responses for filtering
        """
        metrics = []

        for response in responses:
            word_count = len(response.split())
            char_count = len(response)

            # Check for repetitive patterns
            words = response.lower().split()
            unique_words = len(set(words))
            lexical_diversity = unique_words / word_count if word_count > 0 else 0

            # Check for common low-quality patterns
            is_gibberish = word_count < 3 or lexical_diversity < 0.3
            is_single_word = word_count <= 2
            is_repetitive = any(words.count(w) > len(words) * 0.3 for w in set(words))

            quality_score = 1.0
            if is_gibberish:
                quality_score *= 0.3
            if is_single_word:
                quality_score *= 0.5
            if is_repetitive:
                quality_score *= 0.7

            metrics.append({
                "word_count": word_count,
                "char_count": char_count,
                "lexical_diversity": lexical_diversity,
                "quality_score": quality_score
            })

        # Aggregate metrics
        word_counts = [m["word_count"] for m in metrics]
        quality_scores = [m["quality_score"] for m in metrics]

        return {
            "mean_word_count": float(np.mean(word_counts)) if word_counts else 0,
            "median_word_count": float(np.median(word_counts)) if word_counts else 0,
            "mean_quality_score": float(np.mean(quality_scores)) if quality_scores else 0,
            "low_quality_responses": sum(1 for s in quality_scores if s < 0.5),
            "high_quality_responses": sum(1 for s in quality_scores if s >= 0.8),
            "total_responses": len(responses),
            "detailed_metrics": metrics
        }