import { useState } from 'react';
import { Calculator } from 'lucide-react';

export default function SalesSimulator({ costPerUnit, suggestedPrice }) {
  const [quantity, setQuantity] = useState(50);
  
  const revenue = suggestedPrice * quantity;
  const cost = costPerUnit * quantity;
  const profit = revenue - cost;
  
  const presets = [10, 25, 50, 100, 200, 500];

  return (
    <div className="glass rounded-2xl p-6 border border-espresso-600/50 bg-gradient-to-br from-espresso-800 to-espresso-900">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="text-gold-400" />
        <h3 className="font-display font-semibold text-lg text-cream-100">Simulador de Ventas</h3>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <label className="text-sm font-medium text-cream-200">Cantidad a vender</label>
          <span className="text-2xl font-display font-bold text-gold-400">{quantity}</span>
        </div>
        <input 
          type="range" min="1" max="1000" step="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-full h-3 bg-espresso-900 rounded-lg appearance-none cursor-pointer accent-gold-500 mb-4"
        />
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button 
              key={p} 
              onClick={() => setQuantity(p)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                quantity === p ? 'bg-gold-500 text-espresso-900' : 'bg-espresso-700 text-cream-200 hover:bg-espresso-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-espresso-900/60 p-4 rounded-xl border border-espresso-700/50">
          <p className="text-xs text-cream-300 mb-1">Ingresos (Ventas)</p>
          <p className="text-xl font-medium text-cream-100">${revenue.toFixed(2)}</p>
        </div>
        <div className="bg-espresso-900/60 p-4 rounded-xl border border-espresso-700/50">
          <p className="text-xs text-cream-300 mb-1">Costo Total</p>
          <p className="text-xl font-medium text-cream-100">${cost.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-espresso-900/80 p-5 rounded-xl border border-success/30 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 text-6xl opacity-10">💰</div>
        <p className="text-sm text-success font-medium mb-1 relative z-10">Ganancia Neta Estimada</p>
        <p className="text-4xl font-display font-bold text-success relative z-10 drop-shadow-sm">
          ${profit.toFixed(2)}
        </p>
        <div className="mt-3 flex items-center gap-2 relative z-10">
          <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-md font-medium">
            +${(suggestedPrice - costPerUnit).toFixed(2)} c/u
          </span>
        </div>
      </div>
    </div>
  );
}
