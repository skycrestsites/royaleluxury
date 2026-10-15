import { Icon } from './Icon';

/** Edits an ordered list of text entries (paragraphs, bullet points, sizes). */
export function TextListEditor({
  items,
  onChange,
  placeholder,
  multiline = false,
  addLabel = 'Add',
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
  addLabel?: string;
}) {
  const update = (i: number, value: string) => onChange(items.map((item, j) => (j === i ? value : item)));
  return (
    <div className="a-list-editor">
      {items.map((item, i) => (
        <div key={i} className="a-list-row">
          {multiline ? (
            <textarea className="a-input" rows={3} value={item} placeholder={placeholder} onChange={(e) => update(i, e.target.value)} />
          ) : (
            <input className="a-input" value={item} placeholder={placeholder} onChange={(e) => update(i, e.target.value)} />
          )}
          <button type="button" className="a-icon-btn a-icon-btn--danger" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <Icon name="trash" size={16} />
          </button>
        </div>
      ))}
      <button type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={() => onChange([...items, ''])}>
        <Icon name="plus" size={14} /> {addLabel}
      </button>
    </div>
  );
}

/** Edits label and value pairs, used for product specifications. */
export function DetailsEditor({
  items,
  onChange,
}: {
  items: { label: string; value: string }[];
  onChange: (items: { label: string; value: string }[]) => void;
}) {
  const update = (i: number, key: 'label' | 'value', value: string) =>
    onChange(items.map((item, j) => (j === i ? { ...item, [key]: value } : item)));
  return (
    <div className="a-list-editor">
      {items.map((item, i) => (
        <div key={i} className="a-list-row a-list-row--pair">
          <input className="a-input" placeholder="Label, e.g. Material" value={item.label} onChange={(e) => update(i, 'label', e.target.value)} />
          <input className="a-input" placeholder="Value, e.g. 100% cotton" value={item.value} onChange={(e) => update(i, 'value', e.target.value)} />
          <button type="button" className="a-icon-btn a-icon-btn--danger" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <Icon name="trash" size={16} />
          </button>
        </div>
      ))}
      <button type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={() => onChange([...items, { label: '', value: '' }])}>
        <Icon name="plus" size={14} /> Add detail
      </button>
    </div>
  );
}

/** Edits colour options with a name and swatch. */
export function ColorsEditor({
  items,
  onChange,
}: {
  items: { name: string; hex: string }[];
  onChange: (items: { name: string; hex: string }[]) => void;
}) {
  const update = (i: number, key: 'name' | 'hex', value: string) =>
    onChange(items.map((item, j) => (j === i ? { ...item, [key]: value } : item)));
  return (
    <div className="a-list-editor">
      {items.map((item, i) => (
        <div key={i} className="a-list-row a-list-row--color">
          <input type="color" className="a-swatch-input" aria-label={`Swatch for ${item.name || 'colour'}`} value={item.hex} onChange={(e) => update(i, 'hex', e.target.value)} />
          <input className="a-input" placeholder="Colour name" value={item.name} onChange={(e) => update(i, 'name', e.target.value)} />
          <button type="button" className="a-icon-btn a-icon-btn--danger" aria-label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <Icon name="trash" size={16} />
          </button>
        </div>
      ))}
      <button type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={() => onChange([...items, { name: '', hex: '#ffffff' }])}>
        <Icon name="plus" size={14} /> Add colour
      </button>
    </div>
  );
}
