"""
Phase 7: Advanced Visualization Router
API endpoints for data visualization and analytics
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from ..database import get_db
from ..auth import get_current_user
from ..models import User
from ..models_phase7 import (
    ProjectVisualizationCache, ThemeCooccurrence, TimeSeriesMetric,
    GeographicMetric, WordFrequency, SentimentFlow, EngagementMetric,
    CustomVisualization, VisualizationType, AggregationPeriod, CacheStatus
)
from ..schemas_phase7 import (
    WordCloudRequest, WordCloudResponse,
    NetworkGraphRequest, NetworkGraphResponse,
    HeatmapRequest, HeatmapResponse,
    TimelineRequest, TimelineResponse,
    GeographicRequest, GeographicResponse,
    SentimentFlowRequest, SentimentFlowResponse,
    ThemeRiverRequest, ThemeRiverResponse,
    SpeakerMetricsRequest, SpeakerMetricsResponse,
    CustomVizCreate, CustomVizResponse,
    EngagementTrack, CacheStatusResponse
)
from ..services.aggregation_service import AggregationService
from ..services.metrics_service import MetricsService
from ..services.cache_service import MultiTierCacheService

router = APIRouter(prefix="/api/v1/visualization", tags=["visualization"])

# Initialize services
aggregation_service = AggregationService()
metrics_service = MetricsService()
cache_service = MultiTierCacheService()


@router.get("/projects/{project_id}/word-cloud", response_model=WordCloudResponse)
async def get_word_cloud(
    project_id: str,
    language: Optional[str] = Query(None, description="Language filter (en, id, ms, th, vi, tl)"),
    max_words: int = Query(100, ge=10, le=500),
    exclude_stopwords: bool = Query(True),
    time_range: Optional[str] = Query(None, description="Time range (7d, 30d, 90d, all)"),
    theme_id: Optional[str] = Query(None, description="Filter by theme"),
    refresh_cache: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate word cloud data for a project
    Supports multiple languages and code-mixing detection
    """
    # Check project access
    # ... access check logic ...

    # Generate cache key
    cache_key = f"wordcloud:{project_id}:{language}:{max_words}:{time_range}:{theme_id}"

    # Check cache unless refresh requested
    if not refresh_cache:
        cached_data = await cache_service.get(cache_key, db)
        if cached_data:
            return WordCloudResponse(**cached_data)

    # Generate word cloud data
    try:
        word_data = await aggregation_service.generate_word_cloud(
            project_id=project_id,
            language=language,
            max_words=max_words,
            exclude_stopwords=exclude_stopwords,
            time_range=time_range,
            theme_id=theme_id,
            db=db
        )

        # Cache the result
        await cache_service.set(
            key=cache_key,
            value=word_data,
            ttl=3600,  # 1 hour cache
            db=db
        )

        return WordCloudResponse(
            words=word_data["words"],
            metadata={
                "total_words": word_data["total_words"],
                "languages_detected": word_data["languages"],
                "code_mixing_detected": word_data["code_mixing"],
                "generated_at": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_id}/network-graph", response_model=NetworkGraphResponse)
async def get_network_graph(
    project_id: str,
    min_cooccurrence: int = Query(2, ge=1),
    max_nodes: int = Query(50, ge=10, le=200),
    layout: str = Query("force", description="Layout algorithm (force, circular, hierarchical)"),
    confidence_threshold: float = Query(0.5, ge=0, le=1),
    refresh_cache: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate network graph of theme co-occurrences
    Shows relationships between themes/codes
    """
    cache_key = f"network:{project_id}:{min_cooccurrence}:{max_nodes}:{confidence_threshold}"

    if not refresh_cache:
        cached_data = await cache_service.get(cache_key, db)
        if cached_data:
            return NetworkGraphResponse(**cached_data)

    try:
        network_data = await aggregation_service.generate_network_graph(
            project_id=project_id,
            min_cooccurrence=min_cooccurrence,
            max_nodes=max_nodes,
            confidence_threshold=confidence_threshold,
            db=db
        )

        # Apply layout algorithm
        if layout != "raw":
            network_data = await metrics_service.apply_graph_layout(
                network_data, algorithm=layout
            )

        await cache_service.set(cache_key, network_data, ttl=3600, db=db)

        return NetworkGraphResponse(
            nodes=network_data["nodes"],
            edges=network_data["edges"],
            metadata={
                "total_themes": network_data["total_themes"],
                "total_connections": network_data["total_edges"],
                "layout_algorithm": layout,
                "generated_at": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_id}/heatmap", response_model=HeatmapResponse)
async def get_heatmap(
    project_id: str,
    metric: str = Query("sentiment", description="Metric to visualize (sentiment, engagement, themes)"),
    x_axis: str = Query("speaker", description="X-axis dimension (speaker, time, theme)"),
    y_axis: str = Query("theme", description="Y-axis dimension (theme, sentiment, topic)"),
    aggregation: str = Query("mean", description="Aggregation method (mean, sum, count, max, min)"),
    normalize: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate heatmap visualization data
    Flexible 2D matrix visualization
    """
    cache_key = f"heatmap:{project_id}:{metric}:{x_axis}:{y_axis}:{aggregation}"

    cached_data = await cache_service.get(cache_key, db)
    if cached_data:
        return HeatmapResponse(**cached_data)

    try:
        heatmap_data = await aggregation_service.generate_heatmap(
            project_id=project_id,
            metric=metric,
            x_axis=x_axis,
            y_axis=y_axis,
            aggregation=aggregation,
            normalize=normalize,
            db=db
        )

        await cache_service.set(cache_key, heatmap_data, ttl=1800, db=db)

        return HeatmapResponse(
            matrix=heatmap_data["matrix"],
            x_labels=heatmap_data["x_labels"],
            y_labels=heatmap_data["y_labels"],
            metadata={
                "metric": metric,
                "aggregation": aggregation,
                "normalized": normalize,
                "value_range": heatmap_data["value_range"],
                "generated_at": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_id}/timeline", response_model=TimelineResponse)
async def get_timeline(
    project_id: str,
    metrics: List[str] = Query(["sentiment"], description="Metrics to plot"),
    period: str = Query("daily", description="Aggregation period (hourly, daily, weekly, monthly)"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    smoothing: Optional[str] = Query(None, description="Smoothing method (moving_avg, exponential)"),
    window_size: int = Query(3, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate timeline visualization with multiple metrics
    Temporal analysis of project data
    """
    # Default date range if not specified
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    cache_key = f"timeline:{project_id}:{','.join(metrics)}:{period}:{start_date}:{end_date}"

    cached_data = await cache_service.get(cache_key, db)
    if cached_data:
        return TimelineResponse(**cached_data)

    try:
        timeline_data = await aggregation_service.generate_timeline(
            project_id=project_id,
            metrics=metrics,
            period=AggregationPeriod[period.upper()],
            start_date=start_date,
            end_date=end_date,
            db=db
        )

        # Apply smoothing if requested
        if smoothing:
            timeline_data = await metrics_service.apply_smoothing(
                timeline_data,
                method=smoothing,
                window_size=window_size
            )

        await cache_service.set(cache_key, timeline_data, ttl=1800, db=db)

        return TimelineResponse(
            series=timeline_data["series"],
            timestamps=timeline_data["timestamps"],
            metadata={
                "period": period,
                "smoothing": smoothing,
                "window_size": window_size if smoothing else None,
                "data_points": len(timeline_data["timestamps"]),
                "generated_at": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_id}/geographic", response_model=GeographicResponse)
async def get_geographic_data(
    project_id: str,
    metric: str = Query("engagement", description="Metric to map"),
    region: str = Query("sea", description="Region (sea, singapore, indonesia, malaysia, etc.)"),
    resolution: str = Query("country", description="Resolution (country, state, city)"),
    normalize_population: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate geographic visualization data
    SEA-specific regional analytics
    """
    cache_key = f"geo:{project_id}:{metric}:{region}:{resolution}:{normalize_population}"

    cached_data = await cache_service.get(cache_key, db)
    if cached_data:
        return GeographicResponse(**cached_data)

    try:
        geo_data = await aggregation_service.generate_geographic_data(
            project_id=project_id,
            metric=metric,
            region=region,
            resolution=resolution,
            normalize_population=normalize_population,
            db=db
        )

        await cache_service.set(cache_key, geo_data, ttl=7200, db=db)  # 2 hour cache

        return GeographicResponse(
            locations=geo_data["locations"],
            bounds=geo_data["bounds"],
            metadata={
                "metric": metric,
                "region": region,
                "resolution": resolution,
                "total_locations": len(geo_data["locations"]),
                "value_range": geo_data["value_range"],
                "normalized": normalize_population,
                "generated_at": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_id}/sentiment-flow", response_model=SentimentFlowResponse)
async def get_sentiment_flow(
    project_id: str,
    transcript_id: Optional[str] = None,
    resolution: int = Query(100, ge=10, le=1000, description="Number of data points"),
    smoothing: str = Query("moving_avg", description="Smoothing method"),
    window_size: int = Query(5, ge=1, le=50),
    include_emotions: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate sentiment flow visualization
    Shows sentiment progression over conversation
    """
    cache_key = f"sentiment_flow:{project_id}:{transcript_id}:{resolution}:{smoothing}"

    cached_data = await cache_service.get(cache_key, db)
    if cached_data:
        return SentimentFlowResponse(**cached_data)

    try:
        flow_data = await aggregation_service.generate_sentiment_flow(
            project_id=project_id,
            transcript_id=transcript_id,
            resolution=resolution,
            include_emotions=include_emotions,
            db=db
        )

        # Apply smoothing
        flow_data = await metrics_service.apply_smoothing(
            flow_data,
            method=smoothing,
            window_size=window_size
        )

        await cache_service.set(cache_key, flow_data, ttl=3600, db=db)

        return SentimentFlowResponse(
            flow=flow_data["flow"],
            speakers=flow_data["speakers"],
            metadata={
                "resolution": resolution,
                "smoothing": smoothing,
                "window_size": window_size,
                "include_emotions": include_emotions,
                "transcript_count": flow_data["transcript_count"],
                "generated_at": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_id}/theme-river", response_model=ThemeRiverResponse)
async def get_theme_river(
    project_id: str,
    max_themes: int = Query(10, ge=3, le=30),
    period: str = Query("daily", description="Time period"),
    stacked: bool = Query(True, description="Stacked area chart"),
    normalize: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate theme river (streamgraph) visualization
    Shows theme evolution over time
    """
    cache_key = f"theme_river:{project_id}:{max_themes}:{period}:{stacked}:{normalize}"

    cached_data = await cache_service.get(cache_key, db)
    if cached_data:
        return ThemeRiverResponse(**cached_data)

    try:
        river_data = await aggregation_service.generate_theme_river(
            project_id=project_id,
            max_themes=max_themes,
            period=AggregationPeriod[period.upper()],
            stacked=stacked,
            normalize=normalize,
            db=db
        )

        await cache_service.set(cache_key, river_data, ttl=3600, db=db)

        return ThemeRiverResponse(
            themes=river_data["themes"],
            timestamps=river_data["timestamps"],
            values=river_data["values"],
            metadata={
                "period": period,
                "stacked": stacked,
                "normalized": normalize,
                "total_themes": len(river_data["themes"]),
                "generated_at": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_id}/speaker-metrics", response_model=SpeakerMetricsResponse)
async def get_speaker_metrics(
    project_id: str,
    metrics: List[str] = Query(["speaking_time", "word_count", "sentiment"]),
    group_by: str = Query("speaker", description="Grouping (speaker, role, department)"),
    include_demographics: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive speaker metrics
    Analysis of participant contributions
    """
    cache_key = f"speaker_metrics:{project_id}:{','.join(metrics)}:{group_by}"

    cached_data = await cache_service.get(cache_key, db)
    if cached_data:
        return SpeakerMetricsResponse(**cached_data)

    try:
        metrics_data = await metrics_service.calculate_speaker_metrics(
            project_id=project_id,
            metrics=metrics,
            group_by=group_by,
            include_demographics=include_demographics,
            db=db
        )

        await cache_service.set(cache_key, metrics_data, ttl=3600, db=db)

        return SpeakerMetricsResponse(
            speakers=metrics_data["speakers"],
            metrics=metrics_data["metrics"],
            metadata={
                "group_by": group_by,
                "total_speakers": len(metrics_data["speakers"]),
                "include_demographics": include_demographics,
                "generated_at": datetime.utcnow().isoformat()
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/projects/{project_id}/custom", response_model=CustomVizResponse)
async def create_custom_visualization(
    project_id: str,
    viz_data: CustomVizCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Save a custom visualization configuration
    Allows users to save and share custom visualizations
    """
    try:
        custom_viz = CustomVisualization(
            id=str(uuid.uuid4()),
            project_id=project_id,
            user_id=current_user.id,
            name=viz_data.name,
            description=viz_data.description,
            visualization_type=viz_data.visualization_type,
            config=viz_data.config,
            filters=viz_data.filters,
            is_public=viz_data.is_public,
            is_template=viz_data.is_template
        )

        db.add(custom_viz)
        db.commit()
        db.refresh(custom_viz)

        return CustomVizResponse(
            id=custom_viz.id,
            name=custom_viz.name,
            description=custom_viz.description,
            visualization_type=custom_viz.visualization_type,
            config=custom_viz.config,
            is_public=custom_viz.is_public,
            created_at=custom_viz.created_at
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_id}/custom", response_model=List[CustomVizResponse])
async def list_custom_visualizations(
    project_id: str,
    include_public: bool = Query(True),
    include_templates: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List custom visualizations for a project
    """
    query = db.query(CustomVisualization).filter(
        CustomVisualization.project_id == project_id
    )

    # Filter by ownership and visibility
    if not include_public:
        query = query.filter(CustomVisualization.user_id == current_user.id)
    else:
        query = query.filter(
            (CustomVisualization.user_id == current_user.id) |
            (CustomVisualization.is_public == True)
        )

    if include_templates:
        query = query.filter(
            (CustomVisualization.is_template == True) |
            (CustomVisualization.is_template == False)
        )

    visualizations = query.all()

    return [
        CustomVizResponse(
            id=viz.id,
            name=viz.name,
            description=viz.description,
            visualization_type=viz.visualization_type,
            config=viz.config,
            is_public=viz.is_public,
            created_at=viz.created_at
        )
        for viz in visualizations
    ]


@router.post("/engagement/track")
async def track_engagement(
    engagement: EngagementTrack,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Track user engagement with visualizations
    Used for analytics and optimization
    """
    def save_engagement():
        try:
            metric = EngagementMetric(
                id=str(uuid.uuid4()),
                project_id=engagement.project_id,
                user_id=current_user.id,
                action_type=engagement.action_type,
                target_type=engagement.target_type,
                target_id=engagement.target_id,
                duration_seconds=engagement.duration_seconds,
                session_id=engagement.session_id,
                device_type=engagement.device_type,
                country=engagement.country,
                load_time_ms=engagement.load_time_ms,
                render_time_ms=engagement.render_time_ms
            )
            db.add(metric)
            db.commit()
        except Exception as e:
            print(f"Error tracking engagement: {e}")

    background_tasks.add_task(save_engagement)
    return {"status": "tracked"}


@router.get("/cache/status", response_model=CacheStatusResponse)
async def get_cache_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get cache statistics and status
    Admin endpoint for monitoring
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        cache_stats = await cache_service.get_statistics(db)

        return CacheStatusResponse(
            total_entries=cache_stats["total_entries"],
            fresh_entries=cache_stats["fresh_entries"],
            stale_entries=cache_stats["stale_entries"],
            total_size_mb=cache_stats["total_size_mb"],
            hit_rate=cache_stats["hit_rate"],
            avg_computation_time_ms=cache_stats["avg_computation_time"],
            top_accessed=cache_stats["top_accessed"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cache/clear")
async def clear_cache(
    project_id: Optional[str] = None,
    visualization_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Clear visualization cache
    Admin endpoint for cache management
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        cleared_count = await cache_service.clear(
            project_id=project_id,
            visualization_type=visualization_type,
            db=db
        )

        return {
            "status": "success",
            "cleared_entries": cleared_count,
            "message": f"Cleared {cleared_count} cache entries"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/{visualization_type}")
async def export_visualization(
    visualization_type: str,
    project_id: str,
    format: str = Query("json", description="Export format (json, csv, png, svg)"),
    config: Optional[str] = Query(None, description="Visualization config JSON"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export visualization data in various formats
    Supports JSON, CSV, PNG, SVG
    """
    # Check project access
    # ... access check logic ...

    try:
        # Get visualization data based on type
        viz_data = await aggregation_service.get_visualization_data(
            project_id=project_id,
            visualization_type=visualization_type,
            config=config,
            db=db
        )

        # Format based on requested format
        if format == "json":
            return viz_data
        elif format == "csv":
            # Convert to CSV
            csv_data = await metrics_service.convert_to_csv(viz_data)
            return {"csv": csv_data}
        elif format in ["png", "svg"]:
            # Generate image (would require matplotlib/plotly)
            image_data = await metrics_service.generate_image(
                viz_data,
                format=format
            )
            return {"image": image_data}
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))