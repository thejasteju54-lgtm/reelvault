import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { FilterBar } from '../components/reels/FilterBar';
import { ReelGrid } from '../components/reels/ReelGrid';
import { TaxonomyService } from '../services/taxonomy';
import type { Category } from '../types/database';

export function SavedReels() {
  const [searchParams] = useSearchParams();
  const tagParam = searchParams.get('tag') || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    TaxonomyService.getCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Saved Reels</h1>
        <p className="page-subtitle">All your bookmarked content in one place.</p>
      </header>

      <FilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
      />

      <ReelGrid 
        status="all"
        searchQuery={searchQuery}
        categoryId={selectedCategory}
        tag={tagParam}
        emptyIcon={Bookmark}
        emptyTitle={tagParam ? `No reels found for #${tagParam}` : "No saved reels found"}
        emptySubtitle={tagParam ? "Try adjusting your filters or remove the tag." : "Try adjusting your filters or save a new reel."}
      />
    </div>
  );
}
