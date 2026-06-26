// ReelsManager styles - separated from logic
export const styles = {
  container: 'padding: 2rem; max-width: 1400px; margin: 0 auto;',

  header: {
    wrapper: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;',
    title: 'margin: 0; font-size: 2rem;',
    actions: 'display: flex; gap: 1rem;',
  },

  grid: {
    wrapper: 'display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;',
  },

  card: {
    wrapper: 'padding: 1.5rem;',
    header: {
      wrapper: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;',
      title: 'margin: 0; font-size: 1.2rem;',
    },
    description: 'color: var(--color-muted); margin-bottom: 1rem; line-height: 1.5;',
    meta: {
      wrapper: 'display: flex; gap: 1rem; margin-bottom: 1rem; font-size: 0.9rem; color: var(--color-muted);',
      item: 'display: inline;',
    },
    specs: {
      wrapper: 'display: flex; gap: 0.5rem; margin-bottom: 1rem;',
      badge: 'padding: 0.25rem 0.5rem; background: var(--color-paper); border-radius: 4px; font-size: 0.8rem; font-family: var(--font-mono);',
    },
    actions: {
      wrapper: 'display: flex; flex-wrap: wrap; gap: 0.5rem;',
    },
  },

  statusDot: 'width: 12px; height: 12px; border-radius: 50%;',

  button: {
    sm: 'padding: 0.25rem 0.5rem; font-size: 0.875rem;',
    accent: 'background: var(--color-accent); color: white;',
    accentHover: 'background: #0a3935;',
    danger: 'background: #dc3545;',
    dangerHover: 'background: #c82333;',
  },

  emptyState: {
    wrapper: 'text-align: center; padding: 3rem; color: var(--color-muted);',
    icon: 'margin-bottom: 1rem;',
    text: 'margin: 0.5rem 0;',
    muted: 'color: var(--color-muted);',
  },

  loadingState: {
    wrapper: 'text-align: center; padding: 3rem; color: var(--color-muted);',
  },
};

// Helper to get status color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'ready':
      return 'var(--color-accent)';
    case 'processing':
      return 'var(--color-amber)';
    case 'failed':
      return '#dc3545';
    default:
      return 'var(--color-muted)';
  }
};

// Helper to format duration
export const formatDuration = (seconds: number | undefined): string => {
  if (!seconds) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Generate inline style object from CSS string
export const parseStyle = (cssString: string): React.CSSProperties => {
  const style: Record<string, string> = {};
  const declarations = cssString.split(';').filter(d => d.trim());

  declarations.forEach(declaration => {
    const [property, value] = declaration.split(':').map(s => s.trim());
    if (property && value) {
      // Convert kebab-case to camelCase
      const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      style[camelProperty] = value;
    }
  });

  return style as React.CSSProperties;
};
