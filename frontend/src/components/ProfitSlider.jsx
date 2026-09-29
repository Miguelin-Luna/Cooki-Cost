import { Shield, TrendingUp } from 'lucide-react';

export default function ProfitSlider({ protectionMargin, profitMargin, onChange }) {
  return (
    <div className="glass rounded-2xl p-5 border border-espresso-600/50 space-y-6">
      <h3 className="font-display font-semibold text-cream-100 mb-2">Márgenes de Ganancia</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-cream-200 flex items-center gap-2">
            <Shield size={14} className="text-rose" /> 
            Margen de Protección
          </label>
          <span className="text-sm font-bold text-cream-100 bg-espresso-900 px-2 py-0.5 rounded-md">{protectionMargin}%</span>
        </div>
        <input 
          type="range" min="0" max="30" step="1"
          value={protectionMargin}
          onChange={(e) => onChange('protection_margin', parseInt(e.target.value))}
          className="w-full h-2 bg-espresso-900 rounded-lg appearance-none cursor-pointer accent-rose"
        />
        <p className="text-xs text-cream-300">Cubre errores o pérdidas imprevistas</p>
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm font-medium text-cream-200 flex items-center gap-2">
            <TrendingUp size={14} className="text-success" /> 
            Margen de Ganancia
          </label>
          <span className="text-sm font-bold text-cream-100 bg-espresso-900 px-2 py-0.5 rounded-md">{profitMargin}%</span>
        </div>
        <input 
          type="range" min="0" max="100" step="1"
          value={profitMargin}
          onChange={(e) => onChange('profit_margin', parseInt(e.target.value))}
          className="w-full h-2 bg-espresso-900 rounded-lg appearance-none cursor-pointer accent-success"
        />
        <p className="text-xs text-cream-300 mt-1">Margen sobre el precio de venta (Precio = Costo / (1 - %))</p>
      </div>
    </div>
  );
}
