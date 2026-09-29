import { useState, useEffect } from 'react';
import { BookOpen, Wheat, CircleDollarSign, TrendingUp, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import RecipeCard from '../components/RecipeCard';
import { api } from '../api/client';

export default function Dashboard() {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.getRecipes().catch(() => []),
      api.getIngredients().catch(() => [])
    ]).then(([resRecipes, resIngs]) => {
      setRecipes(resRecipes);
      setIngredients(resIngs);
      setLoading(false);
    });
  }, []);

  const avgMargin = recipes.length 
    ? (recipes.reduce((acc, r) => acc + (r.profit_margin || 0), 0) / recipes.length).toFixed(0) 
    : 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-cream-100 mb-2">¡Hola, Baker! 🍪</h2>
          <p className="text-cream-200">Aquí tienes un resumen de tus costos y ganancias.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/ingredients" className="px-4 py-2 bg-espresso-700 hover:bg-espresso-600 text-cream-100 rounded-xl text-sm font-medium transition-colors">
            Ver Ingredientes
          </Link>
          <button onClick={() => navigate('/recipes', { state: { openNew: true } })} className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-xl text-sm font-semibold shadow-lg shadow-gold-500/20 transition-all flex items-center gap-1">
            <Plus size={16} /> Nueva Receta
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={BookOpen} label="Total Recetas" value={loading ? '...' : recipes.length} />
        <StatsCard icon={Wheat} label="Ingredientes" value={loading ? '...' : ingredients.length} />
        <StatsCard icon={TrendingUp} label="Margen Promedio" value={loading ? '...' : `${avgMargin}%`} />
        <StatsCard icon={CircleDollarSign} label="Ganancia Potencial" value="$$$" />
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display font-bold text-cream-100">Recetas Recientes</h3>
          <Link to="/recipes" className="text-sm text-gold-400 hover:text-gold-300 font-medium transition-colors">Ver todas &rarr;</Link>
        </div>
        
        {loading ? (
          <div className="text-cream-300 text-center py-10">Cargando recetas...</div>
        ) : recipes.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center border-dashed border-2 border-espresso-600">
            <p className="text-4xl mb-4">📝</p>
            <p className="text-cream-200 mb-4">Aún no tienes recetas. ¡Crea la primera para empezar a calcular!</p>
            <button onClick={() => navigate('/recipes', { state: { openNew: true } })} className="px-6 py-2 bg-espresso-700 text-cream-100 rounded-xl hover:bg-espresso-600 transition-colors">
              Crear Receta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {recipes.slice(0, 6).map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
