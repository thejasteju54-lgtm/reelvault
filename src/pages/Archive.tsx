import { useState, useEffect } from 'react';
import { Archive as ArchiveIcon } from 'lucide-react';
import { FilterBar } from '../components/reels/FilterBar';
import { ReelGrid } from '../components/reels/ReelGrid';
import { TaxonomyService } from '../services/taxonomy';
import type { Category } from '../types/database';

export function Archive() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    TaxonomyService.getCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Archive</h1>
        <p className="page-subtitle">Processed and archived reels.</p>
      </header>

      <FilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
      />

      <ReelGrid 
        status="archived"
        searchQuery={searchQuery}
        categoryId={selectedCategory}
        emptyIcon={ArchiveIcon}
        emptyTitle="Archive is empty"
        emptySubtitle="Reels you archive will appear here."
      />
    </div>
  );
}
