# Qual Engine - Design Implementation Guide

**For Frontend Developers**
**Version:** 1.0
**Date:** 2026-06-25

This guide shows you how to implement the Qual Engine design system in your React components.

---

## Quick Start

### 1. Import Design Tokens

```tsx
// In your App.tsx or main entry point
import './styles/tokens/colors.css';
import './styles/tokens/typography.css';
import './styles/tokens/spacing.css';
import './styles/tokens/animations.css';
import './styles/components/button.css';
// ... other component styles
```

### 2. Use Design Tokens

```tsx
// Instead of hardcoded values:
// ❌ Don't do this
<div style={{ color: '#0A7AFF', padding: '24px' }}>

// ✅ Do this
<div style={{
  color: 'var(--color-velocity-blue)',
  padding: 'var(--space-xl)'
}}>
```

### 3. Component Example

```tsx
import React from 'react';
import { Zap } from 'lucide-react';

export function StartAnalysisButton({ onClick, loading }) {
  return (
    <button
      className={`btn btn-primary ${loading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={loading}
    >
      {loading && <div className="btn__spinner" />}
      <Zap className="btn__icon" />
      <span className="btn__text">Start Analysis</span>
    </button>
  );
}
```

---

## Component Patterns

### Time-Saved Badge

Show how much time users saved - this is our core value prop.

```tsx
import React from 'react';
import { Zap } from 'lucide-react';

interface TimeSavedBadgeProps {
  hours: number;
  minutes?: number;
  showComparison?: boolean;
}

export function TimeSavedBadge({
  hours,
  minutes = 0,
  showComparison = true
}: TimeSavedBadgeProps) {
  const totalMinutes = hours * 60 + minutes;
  const displayHours = Math.floor(totalMinutes / 60);
  const displayMinutes = totalMinutes % 60;

  return (
    <div className="time-saved-badge">
      <div className="time-saved-badge__content">
        <Zap className="time-saved-badge__icon" />
        <div>
          <div className="time-saved-badge__value">
            {displayHours > 0 && `${displayHours}h `}
            {displayMinutes > 0 && `${displayMinutes}m`}
            {' '}Saved
          </div>
          {showComparison && (
            <div className="time-saved-badge__comparison">
              vs. manual analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

```css
/* time-saved-badge.css */
.time-saved-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-md) var(--space-xl);
  background: linear-gradient(
    135deg,
    rgba(10, 122, 255, 0.1) 0%,
    rgba(123, 79, 255, 0.1) 100%
  );
  border: 2px solid transparent;
  border-image: var(--gradient-speed) 1;
  border-radius: var(--radius-lg);
  animation: scale-bounce 400ms var(--ease-bounce);
}

.time-saved-badge__content {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.time-saved-badge__icon {
  width: 24px;
  height: 24px;
  color: var(--color-velocity-blue);
  animation: pulse 2s ease-in-out infinite;
}

.time-saved-badge__value {
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  background: var(--gradient-speed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.time-saved-badge__comparison {
  font-size: var(--text-sm);
  color: var(--color-slate);
}
```

### Upload Progress Component

Show speed and progress clearly.

```tsx
import React from 'react';
import { Upload, CheckCircle } from 'lucide-react';

interface UploadProgressProps {
  progress: number; // 0-100
  fileName: string;
  fileSize: string;
  uploadSpeed?: string;
  timeRemaining?: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
}

export function UploadProgress({
  progress,
  fileName,
  fileSize,
  uploadSpeed,
  timeRemaining,
  status
}: UploadProgressProps) {
  return (
    <div className="upload-progress">
      <div className="upload-progress__header">
        <div className="upload-progress__file">
          <Upload className="upload-progress__icon" />
          <div>
            <div className="upload-progress__filename">{fileName}</div>
            <div className="upload-progress__filesize">{fileSize}</div>
          </div>
        </div>
        {status === 'complete' && (
          <CheckCircle className="upload-progress__check" />
        )}
      </div>

      <div className="upload-progress__bar">
        <div
          className="upload-progress__fill"
          style={{ width: `${progress}%` }}
        >
          {progress > 10 && (
            <span className="upload-progress__label">
              {progress}%
              {timeRemaining && ` • ${timeRemaining} remaining`}
            </span>
          )}
        </div>
      </div>

      {uploadSpeed && (
        <div className="upload-progress__speed">
          {uploadSpeed} • {status === 'uploading' ? 'Uploading' : 'Processing'}
        </div>
      )}
    </div>
  );
}
```

```css
/* upload-progress.css */
.upload-progress {
  background: var(--color-sheet);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  animation: slide-up 300ms var(--ease-entrance);
}

.upload-progress__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.upload-progress__file {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.upload-progress__icon {
  width: 24px;
  height: 24px;
  color: var(--color-velocity-blue);
}

.upload-progress__filename {
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
  color: var(--color-ink);
}

.upload-progress__filesize {
  font-size: var(--text-sm);
  color: var(--color-slate);
}

.upload-progress__check {
  width: 24px;
  height: 24px;
  color: var(--color-success);
  animation: scale-bounce 400ms var(--ease-bounce);
}

.upload-progress__bar {
  position: relative;
  height: 10px;
  background: var(--color-cloud);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.upload-progress__fill {
  position: relative;
  height: 100%;
  background: var(--gradient-speed);
  border-radius: var(--radius-full);
  transition: width 300ms var(--ease-speed);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: var(--space-sm);
}

.upload-progress__fill::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shimmer 2s ease-in-out infinite;
}

.upload-progress__label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: white;
  white-space: nowrap;
}

.upload-progress__speed {
  margin-top: var(--space-sm);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-velocity-blue);
}
```

### Analysis Grid Cell

Evidence-based cells with click-to-expand.

```tsx
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

interface GridCellProps {
  summary: string;
  evidenceCount: number;
  onEvidenceClick: () => void;
  theme?: string;
  themeColor?: string;
}

export function GridCell({
  summary,
  evidenceCount,
  onEvidenceClick,
  theme,
  themeColor = 'var(--color-theme-1)'
}: GridCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="grid-cell"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ borderLeftColor: themeColor }}
    >
      <div className="grid-cell__summary">
        {summary || <span className="grid-cell__empty">No data</span>}
      </div>

      {evidenceCount > 0 && (
        <button
          className="grid-cell__evidence-btn"
          onClick={onEvidenceClick}
        >
          <MessageSquare className="grid-cell__evidence-icon" />
          {evidenceCount} evidence
        </button>
      )}

      {isHovered && summary && (
        <div className="grid-cell__tooltip">
          {summary}
        </div>
      )}
    </div>
  );
}
```

```css
/* grid-cell.css */
.grid-cell {
  position: relative;
  background: var(--color-sheet);
  border: 1px solid var(--color-hairline);
  border-left: 3px solid var(--color-velocity-blue);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  transition: all 200ms var(--ease-speed);
  min-height: 80px;
}

.grid-cell:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-velocity-blue);
}

.grid-cell__summary {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-charcoal);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.grid-cell__empty {
  color: var(--color-slate);
  font-style: italic;
}

.grid-cell__evidence-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-velocity-blue-ultra-light);
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-velocity-blue);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: all 150ms var(--ease-speed);
}

.grid-cell__evidence-btn:hover {
  background: var(--color-velocity-blue-light);
  color: white;
}

.grid-cell__evidence-icon {
  width: 12px;
  height: 12px;
}

.grid-cell__tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-charcoal);
  color: white;
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-popover);
  animation: fade-in 200ms var(--ease-speed);
}

.grid-cell__tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: var(--space-lg);
  border: 6px solid transparent;
  border-bottom-color: var(--color-charcoal);
}
```

---

## Animation Recipes

### Success Celebration

When analysis completes, celebrate the time saved.

```tsx
import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export function SuccessCelebration({ hoursSaved }: { hoursSaved: number }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="success-celebration">
      <div className="success-celebration__content">
        <Sparkles className="success-celebration__icon" />
        <div>
          <div className="success-celebration__title">
            Analysis Complete!
          </div>
          <div className="success-celebration__subtitle">
            You saved {hoursSaved} hours
          </div>
        </div>
      </div>
      <div className="success-celebration__confetti">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              backgroundColor: [
                'var(--color-velocity-blue)',
                'var(--color-neural-purple)',
                'var(--color-sunset)',
                'var(--color-success)'
              ][i % 4]
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

```css
/* success-celebration.css */
.success-celebration {
  position: fixed;
  top: var(--space-xl);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);
  animation: slide-down 400ms var(--ease-bounce);
}

.success-celebration__content {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-xl);
  background: var(--color-sheet);
  border: 2px solid var(--color-success);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
}

.success-celebration__icon {
  width: 32px;
  height: 32px;
  color: var(--color-success);
  animation: pulse 1s ease-in-out infinite;
}

.success-celebration__title {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-ink);
}

.success-celebration__subtitle {
  font-size: var(--text-sm);
  color: var(--color-slate);
}

.success-celebration__confetti {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  animation: confetti-fall 3s ease-in forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}
```

### Loading Skeleton

Use while content loads to reduce perceived waiting time.

```tsx
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-button" />
    </div>
  );
}
```

```css
/* skeleton.css */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-cloud) 0%,
    #ffffff 50%,
    var(--color-cloud) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

.skeleton-card {
  background: var(--color-sheet);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.skeleton-title {
  height: 24px;
  width: 60%;
  margin-bottom: var(--space-md);
}

.skeleton-text {
  height: 16px;
  width: 100%;
  margin-bottom: var(--space-sm);
}

.skeleton-text:last-of-type {
  width: 80%;
}

.skeleton-button {
  height: 44px;
  width: 120px;
  margin-top: var(--space-lg);
}
```

---

## Responsive Patterns

### Mobile-First Dashboard

```tsx
export function Dashboard() {
  return (
    <div className="container">
      {/* Hero Metric - Prominent on mobile */}
      <div className="dashboard-hero">
        <h1 className="text-display-l">
          Welcome back, Sarah
        </h1>
        <TimeSavedBadge hours={127} showComparison={false} />
      </div>

      {/* Stats Grid - 1 col mobile, 3 col desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mt-xl">
        <StatCard title="Hours Saved" value="12" />
        <StatCard title="Avg Analysis Time" value="45 mins" />
        <StatCard title="Active Projects" value="8" />
      </div>

      {/* Projects List */}
      <div className="mt-3xl">
        <h2 className="text-heading-l mb-lg">Recent Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Project cards */}
        </div>
      </div>
    </div>
  );
}
```

### Responsive Modal

```css
/* modal.css */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(23, 25, 28, 0.5);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal-backdrop);
  animation: fade-in 250ms var(--ease-speed);
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: var(--container-sm);
  width: calc(100% - 32px);
  max-height: calc(100vh - 64px);
  background: var(--color-sheet);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  z-index: var(--z-modal);
  animation: slide-up 300ms var(--ease-entrance);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .modal {
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    transform: none;
    width: 100%;
    max-width: 100%;
    max-height: 90vh;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    animation: slide-up 350ms var(--ease-smooth);
  }
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-xl);
  border-bottom: 1px solid var(--color-hairline);
}

.modal__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-xl);
}

.modal__footer {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  padding: var(--space-lg) var(--space-xl);
  border-top: 1px solid var(--color-hairline);
}

@media (max-width: 768px) {
  .modal__footer {
    flex-direction: column-reverse;
  }

  .modal__footer .btn {
    width: 100%;
  }
}
```

---

## Accessibility Checklist

When implementing components:

- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Focus indicators visible (`:focus-visible`)
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Screen reader labels (aria-label, aria-describedby)
- [ ] Loading states announced (aria-live="polite")
- [ ] Error messages associated with inputs (aria-invalid, aria-errormessage)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Touch targets ≥ 44x44px on mobile
- [ ] Form labels properly associated

---

## Performance Tips

### 1. Lazy Load Heavy Components

```tsx
const AnalysisGrid = React.lazy(() => import('./components/AnalysisGrid'));

// Use with Suspense
<Suspense fallback={<SkeletonGrid />}>
  <AnalysisGrid data={data} />
</Suspense>
```

### 2. Optimize Animations

```tsx
// Use CSS transforms (GPU-accelerated)
// ✅ Good
transform: translateY(-2px);

// ❌ Avoid
top: -2px;
```

### 3. Debounce User Input

```tsx
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

const debouncedSearch = useMemo(
  () => debounce((value) => performSearch(value), 300),
  []
);
```

### 4. Virtual Scrolling for Long Lists

Use react-window for lists with > 100 items.

---

## Common Patterns Library

### Empty State

```tsx
export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Icon className="empty-state__icon" />
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {action && (
        <button className="btn btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}
```

### Toast Notification

```tsx
export function Toast({ type, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast--${type}`}>
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
}
```

---

## Questions?

- Design System Documentation: `/DESIGN_SYSTEM.md`
- Figma File: [Link to Figma]
- Design Team: design@qualengine.com
- Slack Channel: #design-system

