export default function CostBreakdown({ recipe }) {
  if (!recipe || !recipe.ingredients) return null;

  const totalCost = recipe.total_cost || 0;

  return (
    <div className="glass rounded-2xl overflow-hidden border border-espresso-600/50">
      <div className="px-5 py-4 border-b border-espresso-600/50 bg-espresso-900/30">
        <h3 className="font-display font-semibold text-cream-100">Desglose de Costos</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-cream-300 uppercase bg-espresso-900/50">
            <tr>
              <th className="px-5 py-3 font-medium">Ingrediente</th>
              <th className="px-5 py-3 font-medium text-right">Cantidad</th>
              <th className="px-5 py-3 font-medium text-right">Costo Total</th>
              <th className="px-5 py-3 font-medium text-right">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-espresso-600/30">
            {recipe.ingredients.map((item, idx) => {
              const cost = item.line_cost || 0;
              const percentage = totalCost > 0 ? (cost / totalCost) * 100 : 0;
              
              return (
                <tr key={idx} className="hover:bg-espresso-700/20 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="text-cream-100 font-medium">{item.ingredient.name}</div>
                    {item.conversion_details && (
                      <div className="text-[10px] text-cream-300/70 mt-0.5 leading-tight max-w-[200px]" title={item.conversion_details}>
                        {item.conversion_details.length > 50 ? item.conversion_details.substring(0, 47) + "..." : item.conversion_details}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-cream-200 text-right">{item.quantity} {item.unit}</td>
                  <td className="px-5 py-3 text-cream-100 text-right" title={item.conversion_details || ''}>
                    ${cost.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-cream-300 w-8">{percentage.toFixed(0)}%</span>
                      <div className="w-16 h-1.5 bg-espresso-900 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className="h-full bg-gold-500 rounded-full group-hover:bg-gold-400 transition-colors"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-espresso-900/40 font-medium border-t border-espresso-600">
            <tr>
              <td colSpan="2" className="px-5 py-3 text-right text-cream-300 text-xs">Suma de ingredientes:</td>
              <td className="px-5 py-3 text-right text-cream-200 text-xs">${recipe.ingredients.reduce((acc, item) => acc + (item.line_cost || 0), 0).toFixed(2)}</td>
              <td></td>
            </tr>
            <tr>
              <td colSpan="2" className="px-5 py-3 text-right text-rose/80 text-xs">Protección ({recipe.protection_margin}%):</td>
              <td className="px-5 py-3 text-right text-rose/90 text-xs">+${(recipe.ingredients.reduce((acc, item) => acc + (item.line_cost || 0), 0) * (recipe.protection_margin / 100)).toFixed(2)}</td>
              <td></td>
            </tr>
            <tr className="border-t border-espresso-700/50">
              <td colSpan="2" className="px-5 py-4 text-right text-cream-100">Costo Total Protegido:</td>
              <td className="px-5 py-4 text-right text-cream-100 font-bold">${totalCost.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
