import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';
import RecipeCard from '../components/RecipeCard';
import Modal from '../components/Modal';
import RecipeForm from '../components/RecipeForm';
import RecipeImportModal from '../components/RecipeImportModal';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importDraft, setImportDraft] = useState(null);
  const location = useLocation();

  useEffect(() => {
    loadRecipes();
    if (location.state?.openNew) {
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadRecipes = () => {
    api.getRecipes().then(setRecipes).catch(console.error);
  };

  const handleSave = async (data, imageFile) => {
    try {
      const newRecipe = await api.createRecipe(data);
      if (imageFile) {
        await api.uploadRecipeImage(newRecipe.id, imageFile);
      }
      setIsModalOpen(false);
      loadRecipes();
    } catch (e) {
      console.error(e);
      alert('Error al guardar la receta');
    }
  };

  const categories = ['all', ...new Set(recipes.map(r => r.category).filter(Boolean))];

  const filtered = recipes.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesFavorite = !favoriteFilter || r.is_favorite;
    return matchesSearch && matchesCategory && matchesFavorite;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-display font-bold text-cream-100">Mis Recetas</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="px-4 py-2 bg-espresso-800 hover:bg-espresso-700 border border-espresso-600 text-cream-100 rounded-xl text-sm font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
          >
            📷 Importar Foto
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-xl text-sm font-semibold shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Nueva Receta
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-300" size={18} />
          <input 
            type="text" 
            placeholder="Buscar recetas..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-espresso-800/80 border border-espresso-600 rounded-xl text-cream-100 placeholder-cream-300 focus:outline-none focus:border-gold-500 transition-colors"
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-espresso-800/80 border border-espresso-600 rounded-xl px-4 py-2.5 text-sm text-cream-100 focus:outline-none focus:border-gold-500 transition-colors"
          >
            <option value="all">Todas las Categorías</option>
            {categories.filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          
          <button 
            onClick={() => setFavoriteFilter(!favoriteFilter)}
            className={`px-4 py-2.5 rounded-xl border text-sm flex items-center gap-2 transition-colors ${favoriteFilter ? 'bg-gold-500/10 border-gold-500 text-gold-400' : 'bg-espresso-800/80 border-espresso-600 text-cream-200'}`}
          >
            ★ Favoritas
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center border-dashed border-2 border-espresso-600 mt-8">
          <p className="text-4xl mb-4">🤷‍♂️</p>
          <p className="text-cream-200">No se encontraron recetas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => { setIsModalOpen(false); setImportDraft(null); }}
          title="Nueva Receta"
        >
          <RecipeForm 
            initialData={importDraft}
            onSubmit={handleSave} 
            onCancel={() => { setIsModalOpen(false); setImportDraft(null); }} 
          />
        </Modal>

        <RecipeImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onConfirm={(draftData, file) => {
             setImportDraft({...draftData, imageFile: file});
             setIsImportModalOpen(false);
             setIsModalOpen(true);
          }}
        />
      </div>
  );
}
