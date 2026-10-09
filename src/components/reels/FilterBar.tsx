import { Search, Filter } from 'lucide-react';
import type { Category } from '../../types/database';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  categories: Category[];
}

export function FilterBar({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange,
  categories 
}: FilterBarProps) {
  return (
    <div style={{
      display: 'flex',
      gap: 'var(--space-4)',
      alignItems: 'center',
      marginBottom: 'var(--space-6)',
      flexWrap: 'wrap'
    }}>
      <div style={{ position: 'relative', flex: '1 1 300px' }}>
        <Search 
          size={18} 
          style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} 
        />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, notes, tags..."
          style={{
            width: '100%',
            padding: '10px 12px 10px 40px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-input)',
            fontSize: 'var(--text-sm)',
            outline: 'none',
            transition: 'all var(--transition-fast)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--border-focus)';
            e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-subtle)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <Filter size={16} color="var(--text-muted)" />
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={{
            padding: '10px 36px 10px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-input)',
            fontSize: 'var(--text-sm)',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'none',
          }}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
