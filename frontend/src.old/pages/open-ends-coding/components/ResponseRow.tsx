// ResponseRow component - Virtual scroll list item
import React from 'react';
import type { Response } from '../types';
import { parseStyle } from '../OpenEndsCoding.styles';

interface ResponseRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    responses: Response[];
    selectedResponses: Set<string>;
    onToggleSelection: (id: string) => void;
  };
}

export const ResponseRow: React.FC<ResponseRowProps> = ({ index, style, data }) => {
  const { responses, selectedResponses, onToggleSelection } = data;
  const response = responses[index];

  if (!response) return null;

  const isSelected = selectedResponses.has(response.id);

  const styles = {
    wrapper: 'display: flex; align-items: flex-start; padding-left: 1rem; padding-right: 1rem; padding-top: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgb(229, 231, 235);',
    checkbox: 'margin-top: 0.25rem; margin-right: 0.75rem;',
    content: 'flex: 1;',
    header: 'display: flex; align-items: flex-start; justify-content: space-between;',
    text: 'font-size: 0.875rem; color: rgb(17, 24, 39);',
    meta: 'display: flex; align-items: center; gap: 1rem; margin-top: 0.25rem; font-size: 0.75rem; color: rgb(107, 114, 128);',
    codes: 'display: flex; flex-wrap: wrap; gap: 0.25rem; max-width: 20rem;',
    codeBadge: 'padding-left: 0.5rem; padding-right: 0.5rem; padding-top: 0.25rem; padding-bottom: 0.25rem; font-size: 0.75rem; border-radius: 9999px;',
    confidence: 'margin-left: 0.25rem; opacity: 0.6;',
  };

  const getConfidenceStyle = (confidence: number): React.CSSProperties => {
    if (confidence > 0.8) {
      return {
        ...parseStyle(styles.codeBadge),
        backgroundColor: 'rgb(220, 252, 231)',
        color: 'rgb(22, 163, 74)',
      };
    }
    if (confidence > 0.6) {
      return {
        ...parseStyle(styles.codeBadge),
        backgroundColor: 'rgb(254, 243, 199)',
        color: 'rgb(161, 98, 7)',
      };
    }
    return {
      ...parseStyle(styles.codeBadge),
      backgroundColor: 'rgb(243, 244, 246)',
      color: 'rgb(55, 65, 81)',
    };
  };

  return (
    <div style={{ ...style, ...parseStyle(styles.wrapper) }}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelection(response.id)}
        style={parseStyle(styles.checkbox)}
      />
      <div style={parseStyle(styles.content)}>
        <div style={parseStyle(styles.header)}>
          <div style={{ flex: 1 }}>
            <p style={parseStyle(styles.text)}>{response.text}</p>
            <div style={parseStyle(styles.meta)}>
              <span>ID: {response.respondent_id}</span>
              <span>{response.market}</span>
              <span>{response.date}</span>
            </div>
          </div>
          <div style={parseStyle(styles.codes)}>
            {response.codes.map((code, idx) => (
              <span key={idx} style={getConfidenceStyle(code.confidence)}>
                {code.label}
                {code.confidence && (
                  <span style={parseStyle(styles.confidence)}>
                    {Math.round(code.confidence * 100)}%
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseRow;
