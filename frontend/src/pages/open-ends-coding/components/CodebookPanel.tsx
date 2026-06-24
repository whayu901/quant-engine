// CodebookPanel component - Codebook management sidebar
import React, { useState } from 'react';
import type { Code } from '../types';
import { parseStyle } from '../OpenEndsCoding.styles';

interface CodebookPanelProps {
  codes: Code[];
  onAddCode: (code: Omit<Code, 'id'>) => void;
  onEditCode: (id: number, updates: Partial<Code>) => void;
  onDeleteCode: (id: number) => void;
}

export const CodebookPanel: React.FC<CodebookPanelProps> = ({
  codes,
  onAddCode,
  onEditCode,
  onDeleteCode,
}) => {
  const [newCode, setNewCode] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const styles = {
    wrapper: 'background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); padding: 1rem;',
    title: 'font-weight: 600; margin-bottom: 1rem;',
    inputWrapper: 'margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem;',
    input: 'width: 100%; padding-left: 0.75rem; padding-right: 0.75rem; padding-top: 0.5rem; padding-bottom: 0.5rem; border: 1px solid rgb(209, 213, 219); border-radius: 0.5rem; font-size: 0.875rem;',
    addButton: 'width: 100%; padding-left: 0.75rem; padding-right: 0.75rem; padding-top: 0.5rem; padding-bottom: 0.5rem; background-color: rgb(37, 99, 235); color: white; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer; border: none;',
    listWrapper: 'max-height: 24rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem;',
    listItem: 'display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; border: 1px solid rgb(209, 213, 219); border-radius: 0.25rem;',
    itemLabel: 'flex: 1;',
    itemTitle: 'font-size: 0.875rem; font-weight: 500;',
    itemDescription: 'font-size: 0.75rem; color: rgb(107, 114, 128);',
    itemCount: 'font-size: 0.75rem; color: rgb(156, 163, 175);',
    removeButton: 'color: rgb(239, 68, 68); font-size: 0.75rem; cursor: pointer; background: none; border: none; padding: 0;',
  };

  const handleAddCode = () => {
    if (newCode.trim()) {
      onAddCode({
        label: newCode,
        description: newDescription,
        count: 0,
      });
      setNewCode('');
      setNewDescription('');
    }
  };

  return (
    <div style={parseStyle(styles.wrapper)}>
      <h3 style={parseStyle(styles.title)}>Codebook</h3>

      <div style={parseStyle(styles.inputWrapper)}>
        <input
          type="text"
          placeholder="Code label..."
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          style={parseStyle(styles.input)}
        />
        <input
          type="text"
          placeholder="Description (optional)..."
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          style={parseStyle(styles.input)}
        />
        <button onClick={handleAddCode} style={parseStyle(styles.addButton)}>
          Add Code
        </button>
      </div>

      <div style={parseStyle(styles.listWrapper)}>
        {codes.map((code) => (
          <div key={code.id} style={parseStyle(styles.listItem)}>
            <div style={parseStyle(styles.itemLabel)}>
              <p style={parseStyle(styles.itemTitle)}>{code.label}</p>
              {code.description && (
                <p style={parseStyle(styles.itemDescription)}>
                  {code.description}
                </p>
              )}
              <p style={parseStyle(styles.itemCount)}>Used: {code.count} times</p>
            </div>
            <button
              onClick={() => onDeleteCode(code.id)}
              style={parseStyle(styles.removeButton)}
              title="Remove code"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodebookPanel;
