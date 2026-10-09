import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { FilterBar } from '../components/reels/FilterBar';
import { ReelGrid } from '../components/reels/ReelGrid';
import { TaxonomyService } from '../services/taxonomy';
import type { Category } from '../types/database';

export function Favorites() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    TaxonomyService.getCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Favorites</h1>
        <p className="page-subtitle">Your most important and frequently referenced reels.</p>
      </header>

      <FilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
      />

      <ReelGrid 
        status="favorites"
        searchQuery={searchQuery}
        categoryId={selectedCategory}
        emptyIcon={Star}
        emptyTitle="No favorites yet"
        emptySubtitle="Star a reel to add it to your favorites."
      />
    </div>
  );
}
