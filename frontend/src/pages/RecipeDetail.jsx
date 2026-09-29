import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Copy, Trash2, CheckCircle2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { api } from '../api/client';
import CostBreakdown from '../components/CostBreakdown';
import ProfitSlider from '../components/ProfitSlider';
import SalesSimulator from '../components/SalesSimulator';
import Modal from '../components/Modal';
import RecipeForm from '../components/RecipeForm';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = () => {
    api.getRecipe(id)
      .then(data => { setRecipe(data); setLoading(false); })
      .catch(() => { navigate('/recipes'); });
  };

  const handleUpdateMargin = async (field, value) => {
    if (!recipe) return;
    const newData = { ...recipe, [field]: value };
    // Optimistic update for UI feel
    setRecipe(newData);
    try {
      const updated = await api.updateRecipe(id, newData);
      setRecipe(updated);
    } catch (e) {
      console.error(e);
      loadRecipe(); // revert on fail
    }
  };

  const handleToggleFavorite = async () => {
    if (!recipe) return;
    handleUpdateMargin('is_favorite', !recipe.is_favorite);
  };

  const handleEdit = async (data, imageFile) => {
    try {
      await api.updateRecipe(id, data);
      if (imageFile) {
        await api.uploadRecipeImage(id, imageFile);
      }
      setIsEditModalOpen(false);
      loadRecipe();
    } catch(e) { console.error(e); }
  };

  const handleDuplicate = async () => {
    try {
      const dup = await api.duplicateRecipe(id, `Copia de ${recipe.name}`);
      navigate(`/recipes/${dup.id}`);
    } catch(e) { console.error(e); }
  };

  const handleDelete = async () => {
    if(confirm('¿Eliminar esta receta?')) {
      try {
        await api.deleteRecipe(id);
        navigate('/recipes');
      } catch(e) { console.error(e); }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type on client
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert("Solo se permiten imgenes JPG, PNG o WEBP");
      return;
    }

    setIsUploading(true);
    try {
      const updated = await api.uploadRecipeImage(id, file);
      setRecipe(updated);
    } catch (err) {
      console.error(err);
      alert("Error subiendo imagen");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading || !recipe) return <div className="text-center py-10 text-cream-300">Cargando...</div>;

  return (
    <div className="space-y-6 pb-10 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-espresso-800/30 p-6 rounded-2xl border border-espresso-600/30">
        <div className="flex items-center gap-6">
          <Link to="/recipes" className="p-2 bg-espresso-800 rounded-lg text-cream-300 hover:text-cream-100 transition-colors self-start mt-2">
            <ArrowLeft size={20} />
          </Link>
          
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/jpeg, image/png, image/webp" 
              onChange={handleImageUpload}
            />
            {recipe.image_url ? (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-lg border-2 border-espresso-600 group-hover:border-gold-500 transition-colors">
                <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                  <UploadCloud className="text-white" size={32} />
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-espresso-800 border-2 border-dashed border-espresso-600 group-hover:border-gold-500 flex flex-col items-center justify-center text-espresso-600 group-hover:text-gold-500 transition-colors shadow-inner">
                <ImageIcon size={32} className="mb-2" />
                <span className="text-xs font-medium text-center px-2">Subir Foto</span>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-espresso-900/80 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={handleToggleFavorite} className={`text-xl transition-colors ${recipe.is_favorite ? 'text-gold-500 hover:text-gold-400' : 'text-espresso-600 hover:text-gold-500/50'}`} title="Favorito">
                ★
              </button>
              {recipe.category && (
                <span className="text-[10px] uppercase tracking-wider font-semibold text-espresso-400 bg-espresso-900 px-2 py-0.5 rounded-full border border-espresso-600">
                  {recipe.category}
                </span>
              )}
            </div>
            <h2 className="text-3xl font-display font-bold text-cream-100 flex items-center gap-2">
              {recipe.name}
            </h2>
            <p className="text-cream-300 text-sm mt-1">Rinde: {recipe.yield_quantity} {recipe.yield_unit}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsEditModalOpen(true)} className="p-2 bg-espresso-800 hover:bg-espresso-700 text-cream-200 rounded-lg transition-colors" title="Editar">
            <Edit2 size={18} />
          </button>
          <button onClick={handleDuplicate} className="p-2 bg-espresso-800 hover:bg-espresso-700 text-cream-200 rounded-lg transition-colors" title="Duplicar">
            <Copy size={18} />
          </button>
          <button onClick={handleDelete} className="p-2 bg-espresso-800 hover:bg-danger/20 text-danger rounded-lg transition-colors" title="Eliminar">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <CostBreakdown recipe={recipe} />
          
          <ProfitSlider 
            protectionMargin={recipe.protection_margin} 
            profitMargin={recipe.profit_margin} 
            onChange={handleUpdateMargin}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="glass rounded-2xl p-6 border border-espresso-600/50 bg-gradient-to-b from-espresso-800 to-espresso-900 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <h3 className="text-sm font-medium text-cream-300 mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" />
              Precio Sugerido
            </h3>
            
            <div className="flex items-baseline gap-2 mb-6 relative z-10">
              <span className="text-5xl font-display font-bold text-success drop-shadow-sm">
                ${(recipe.suggested_price || 0).toFixed(2)}
              </span>
              <span className="text-sm text-cream-300">/ u</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-espresso-700 relative z-10">
              <div className="flex justify-between text-sm">
                <span className="text-cream-300">Costo Unitario</span>
                <span className="text-cream-100 font-medium">${(recipe.cost_per_unit || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cream-300">Ganancia Neta (x1)</span>
                <span className="text-success font-medium">+${((recipe.suggested_price || 0) - (recipe.cost_per_unit || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 mt-2 border-t border-espresso-700/50">
                <span className="text-cream-200 font-medium">Ganancia Total (Receta)</span>
                <span className="text-success font-bold">${(recipe.total_profit || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <SalesSimulator 
            costPerUnit={recipe.cost_per_unit || 0} 
            suggestedPrice={recipe.suggested_price || 0} 
          />
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Receta">
        <RecipeForm initialData={recipe} onSubmit={handleEdit} onCancel={() => setIsEditModalOpen(false)} />
      </Modal>
    </div>
  );
}
