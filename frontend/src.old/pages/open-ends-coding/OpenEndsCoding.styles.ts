// OpenEndsCoding styles - separated from logic
export const styles = {
  container: 'min-height: 100vh; background-color: rgb(249, 250, 251);',

  header: {
    wrapper: 'background-color: white; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); border-bottom: 1px solid rgb(229, 231, 235);',
    inner: 'max-width: 80rem; margin: 0 auto; padding: 1.5rem; padding-left: 1rem; padding-right: 1rem;',
    title: 'margin: 0; font-size: 1.875rem; font-weight: bold; color: rgb(17, 24, 39);',
    subtitle: 'margin-top: 0.5rem; font-size: 0.875rem; color: rgb(75, 85, 99);',
  },

  main: {
    wrapper: 'max-width: 80rem; margin: 0 auto; padding: 2rem 1rem;',
  },

  statsGrid: {
    wrapper: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;',
  },

  statCard: {
    wrapper: 'background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); padding: 1rem;',
    inner: 'display: flex; align-items: center; justify-content: space-between;',
    content: 'flex: 1;',
    value: 'font-size: 1.5rem; font-weight: bold;',
    label: 'font-size: 0.875rem; color: rgb(75, 85, 99);',
    icon: 'height: 2rem; width: 2rem;',
  },

  gridLayout: 'display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem;',

  mainContent: 'grid-column: span 9;',
  sidebar: 'grid-column: span 3;',

  toolbarCard: {
    wrapper: 'background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); padding: 1rem;',
    controls: 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;',
    searchBar: {
      wrapper: 'position: relative;',
      icon: 'position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); height: 1rem; width: 1rem; color: rgb(156, 163, 175);',
      input: 'padding-left: 2.5rem; padding-right: 1rem; padding-top: 0.5rem; padding-bottom: 0.5rem; border: 1px solid rgb(209, 213, 219); border-radius: 0.5rem; font-size: 0.875rem;',
    },
    select: 'padding-left: 1rem; padding-right: 1rem; padding-top: 0.5rem; padding-bottom: 0.5rem; border: 1px solid rgb(209, 213, 219); border-radius: 0.5rem;',
    actions: 'display: flex; align-items: center; gap: 0.5rem;',
    button: 'padding-left: 1rem; padding-right: 1rem; padding-top: 0.5rem; padding-bottom: 0.5rem; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer;',
    buttonPrimary: 'background-color: rgb(37, 99, 235); color: white;',
    buttonSuccess: 'background-color: rgb(16, 185, 129); color: white;',
    buttonText: 'color: rgb(75, 85, 99);',
    selectedCount: 'font-size: 0.875rem; color: rgb(75, 85, 99);',
    progressBar: {
      wrapper: 'margin-top: 1rem;',
      label: 'display: flex; align-items: center; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.25rem;',
      track: 'width: 100%; background-color: rgb(229, 231, 235); border-radius: 9999px; height: 0.5rem;',
      fill: 'background-color: rgb(37, 99, 235); height: 0.5rem; border-radius: 9999px; transition: width 300ms;',
    },
    info: 'font-size: 0.875rem; color: rgb(107, 114, 128); margin-top: 0.5rem;',
  },

  responsesTable: {
    wrapper: 'background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);',
    container: 'height: 600px;',
  },

  responseRow: {
    wrapper: 'display: flex; align-items: flex-start; padding-left: 1rem; padding-right: 1rem; padding-top: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgb(229, 231, 235);',
    hoverState: 'background-color: rgb(249, 250, 251);',
    checkbox: 'margin-top: 0.25rem; margin-right: 0.75rem;',
    content: 'flex: 1;',
    header: 'display: flex; align-items: flex-start; justify-content: space-between;',
    text: 'font-size: 0.875rem; color: rgb(17, 24, 39);',
    meta: 'display: flex; align-items: center; gap: 1rem; margin-top: 0.25rem; font-size: 0.75rem; color: rgb(107, 114, 128);',
    codes: 'display: flex; flex-wrap: wrap; gap: 0.25rem; max-width: 20rem;',
    codeBadge: 'padding-left: 0.5rem; padding-right: 0.5rem; padding-top: 0.25rem; padding-bottom: 0.25rem; font-size: 0.75rem; border-radius: 9999px;',
    codeBadgeHigh: 'background-color: rgb(220, 252, 231); color: rgb(22, 163, 74);',
    codeBadgeMedium: 'background-color: rgb(254, 243, 199); color: rgb(161, 98, 7);',
    codeBadgeLow: 'background-color: rgb(243, 244, 246); color: rgb(55, 65, 81);',
    confidence: 'margin-left: 0.25rem; opacity: 0.6;',
  },

  analyticsGrid: {
    wrapper: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;',
  },

  chartCard: {
    wrapper: 'background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); padding: 1rem;',
    title: 'font-weight: 600; margin-bottom: 1rem;',
  },

  codebookPanel: {
    wrapper: 'background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); padding: 1rem;',
    title: 'font-weight: 600; margin-bottom: 1rem;',
    input: {
      wrapper: 'margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem;',
      field: 'width: 100%; padding-left: 0.75rem; padding-right: 0.75rem; padding-top: 0.5rem; padding-bottom: 0.5rem; border: 1px solid rgb(209, 213, 219); border-radius: 0.5rem; font-size: 0.875rem;',
      button: 'width: 100%; padding-left: 0.75rem; padding-right: 0.75rem; padding-top: 0.5rem; padding-bottom: 0.5rem; background-color: rgb(37, 99, 235); color: white; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer;',
    },
    list: {
      wrapper: 'max-height: 24rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem;',
      item: 'display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border: 1px solid rgb(209, 213, 219); border-radius: 0.25rem;',
      itemHover: 'background-color: rgb(249, 250, 251);',
      label: 'flex: 1;',
      labelTitle: 'font-size: 0.875rem; font-weight: 500;',
      description: 'font-size: 0.75rem; color: rgb(107, 114, 128);',
      count: 'font-size: 0.75rem; color: rgb(156, 163, 175);',
      removeButton: 'color: rgb(239, 68, 68); font-size: 0.75rem; cursor: pointer;',
    },
  },

  loading: {
    wrapper: 'display: flex; align-items: center; justify-content: center; height: 100vh;',
    spinner: 'animation: spin 1s linear infinite; border-radius: 9999px; height: 2rem; width: 2rem; border-width: 2px; border-color: rgb(37, 99, 235) transparent rgb(37, 99, 235) transparent;',
  },
};

// Helper to get confidence color
export const getConfidenceColor = (confidence: number): string => {
  if (confidence > 0.8) return 'bg-green-100 text-green-800';
  if (confidence > 0.6) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-800';
};

// Helper to parse CSS string to style object
export const parseStyle = (cssString: string): React.CSSProperties => {
  const style: Record<string, any> = {};
  const declarations = cssString.split(';').filter((d) => d.trim());

  declarations.forEach((declaration) => {
    const [property, value] = declaration.split(':').map((s) => s.trim());
    if (property && value) {
      const camelProperty = property.replace(/-([a-z])/g, (g) =>
        g[1].toUpperCase()
      );
      style[camelProperty] = value;
    }
  });

  return style as React.CSSProperties;
};
