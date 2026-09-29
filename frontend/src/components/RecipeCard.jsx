import { Link } from 'react-router-dom';
import { ChefHat, PieChart, Cookie } from 'lucide-react';

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipes/${recipe.id}`} className="block h-full">
      <div className="glass rounded-2xl card-hover h-full flex flex-col group relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-gold-500/10 transition-colors"></div>
        
        {/* Recipe Image */}
        <div className="w-full h-40 overflow-hidden bg-espresso-800 relative z-10 shrink-0">
          {recipe.image_url ? (
            <img 
              src={recipe.image_url} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              alt={recipe.name} 
            />
          ) : (
            <div className="flex items-center justify-center h-full text-espresso-600 group-hover:text-gold-500/50 transition-colors">
               <Cookie size={48} />
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {recipe.is_favorite && <span className="text-gold-500">★</span>}
                {recipe.category && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-espresso-400 bg-espresso-900 px-2 py-0.5 rounded-full border border-espresso-600">
                    {recipe.category}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-display font-semibold text-cream-100 flex items-center gap-2">
                <span>🍪</span> {recipe.name}
              </h3>
            </div>
            <span className="bg-espresso-900/80 text-xs px-2.5 py-1 rounded-md text-gold-400 border border-gold-500/20 font-medium shrink-0">
              {recipe.profit_margin}% Margen
            </span>
          </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4 mt-auto relative z-10">
          <div className="bg-espresso-900/40 rounded-xl p-3 border border-espresso-600/30">
            <p className="text-xs text-cream-300 mb-1 flex items-center gap-1"><ChefHat size={12}/> Rinde</p>
            <p className="font-medium text-cream-100">{recipe.yield_quantity} <span className="text-xs">{recipe.yield_unit}</span></p>
          </div>
          <div className="bg-espresso-900/40 rounded-xl p-3 border border-espresso-600/30">
            <p className="text-xs text-cream-300 mb-1 flex items-center gap-1"><PieChart size={12}/> Costo Total</p>
            <p className="font-medium text-cream-100">${(recipe.total_cost || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="border-t border-espresso-600/50 pt-4 flex justify-between items-end relative z-10">
          <div>
            <p className="text-xs text-cream-300">Costo c/u</p>
            <p className="text-sm font-medium text-cream-200">${(recipe.cost_per_unit || 0).toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-cream-300 font-medium">Precio Sugerido</p>
            <p className="text-xl font-display font-bold text-success drop-shadow-sm">
              ${(recipe.suggested_price || 0).toFixed(2)}
            </p>
          </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
