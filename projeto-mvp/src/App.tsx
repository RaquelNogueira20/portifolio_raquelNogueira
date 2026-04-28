import React from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Hero } from './components/sections/Hero';
import { Features } from './components/sections/Features';
import { SearchResults, SearchResult } from './components/sections/SearchResults';
import { ListManager } from './components/sections/ListManager';
import { PlatformCoverage } from './components/sections/PlatformCoverage';
import { Stats } from './components/sections/Stats';
import { FAQ } from './components/sections/FAQ';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent = () => {
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [currentQuery, setCurrentQuery] = React.useState('');
  const [searchType, setSearchType] = React.useState<'username' | 'email'>('username');
  const { user } = useAuth();

  const handleSearch = (query: string, results: SearchResult[], type: 'username' | 'email', searchingOverride?: boolean) => {
    setCurrentQuery(query);
    setSearchResults(results);
    setSearchType(type);
    
    if (searchingOverride !== undefined) {
      setIsSearching(searchingOverride);
      return;
    }

    const totalItems = type === 'username' ? 14 : 10;
    
    if (results.length === 0 && query) {
      setIsSearching(true);
    } 
    else if (results.length === totalItems) {
      setIsSearching(false);
    }
  };

  return (
    <MainLayout>
      <Hero onSearch={handleSearch} isSearching={isSearching} />
      
      <SearchResults 
        results={searchResults} 
        isSearching={isSearching} 
        query={currentQuery}
        type={searchType}
      />

      {user && <ListManager />}

      <Features />
      
      <PlatformCoverage />
      
      <Stats />
      
      <FAQ />
      <Toaster position="top-center" richColors />
    </MainLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
