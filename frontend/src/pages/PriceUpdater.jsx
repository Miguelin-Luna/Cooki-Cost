import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { TrendingUp, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PriceUpdater() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [edits, setEdits] = useState({});

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const data = await api.getIngredients();
      setIngredients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isOutdated = (dateString) => {
    if (!dateString) return true;
    const updateDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - updateDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays > 30;
  };

  const handleEdit = (id, field, value) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value === '' ? '' : parseFloat(value)
      }
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    const itemsToUpdate = [];
    for (const id in edits) {
      if (edits[id].package_cost !== undefined || edits[id].package_quantity !== undefined) {
        itemsToUpdate.push({
          id: parseInt(id),
          package_cost: edits[id].package_cost !== '' ? edits[id].package_cost : undefined,
          package_quantity: edits[id].package_quantity !== '' ? edits[id].package_quantity : undefined
        });
      }
    }

    if (itemsToUpdate.length === 0) return;

    setSaving(true);
    try {
      await api.bulkUpdateIngredients(itemsToUpdate);
      setSuccess(true);
      setEdits({});
      await loadIngredients();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error guardando cambios');
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = Object.keys(edits).length > 0;

  if (loading) return <div className="p-8 text-cream-300">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-cream-100 flex items-center gap-2">
            <TrendingUp className="text-gold-400" /> Actualización Rápida
          </h2>
          <p className="text-cream-200 text-sm mt-1">Revisa y actualiza los precios de tus ingredientes rápidamente.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={!hasUnsavedChanges || saving}
          className={`px-6 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${
            saving ? 'bg-espresso-600 text-cream-300' :
            success ? 'bg-success/20 text-success border border-success/50' :
            hasUnsavedChanges ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-espresso-900 shadow-lg shadow-gold-500/20' :
            'bg-espresso-800 text-cream-400'
          }`}
        >
          {saving ? 'Guardando...' : success ? <><CheckCircle2 size={18} /> Guardado</> : <><Save size={18} /> Guardar Cambios</>}
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-espresso-600/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-espresso-900/50 text-xs uppercase text-cream-300">
              <tr>
                <th className="px-6 py-4 font-medium">Ingrediente</th>
                <th className="px-6 py-4 font-medium">Última Act.</th>
                <th className="px-6 py-4 font-medium w-40">Cant. Empaque</th>
                <th className="px-6 py-4 font-medium w-40">Costo Empaque ($)</th>
                <th className="px-6 py-4 font-medium w-32">Costo Base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso-600/30">
              {ingredients.map(ing => {
                const isOld = isOutdated(ing.last_price_update);
                const currentEdit = edits[ing.id] || {};
                const displayQty = currentEdit.package_quantity !== undefined ? currentEdit.package_quantity : ing.package_quantity;
                const displayCost = currentEdit.package_cost !== undefined ? currentEdit.package_cost : ing.package_cost;
                const baseCost = displayQty > 0 ? (displayCost / displayQty) : 0;
                
                return (
                  <tr key={ing.id} className="hover:bg-espresso-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-cream-100">{ing.name}</div>
                      {ing.brand && <div className="text-[10px] text-cream-400 mt-1">{ing.brand}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 text-xs ${isOld ? 'text-rose font-medium' : 'text-cream-300'}`}>
                        {isOld && <AlertCircle size={14} />}
                        {new Date(ing.last_price_update).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={displayQty === '' ? '' : displayQty}
                          onChange={(e) => handleEdit(ing.id, 'package_quantity', e.target.value)}
                          className={`w-24 bg-espresso-900/80 border ${currentEdit.package_quantity !== undefined ? 'border-gold-500' : 'border-espresso-600'} rounded-lg px-3 py-1.5 text-cream-100 focus:outline-none focus:border-gold-400`}
                        />
                        <span className="text-cream-300 text-xs">{ing.unit}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.01"
                        value={displayCost === '' ? '' : displayCost}
                        onChange={(e) => handleEdit(ing.id, 'package_cost', e.target.value)}
                        className={`w-24 bg-espresso-900/80 border ${currentEdit.package_cost !== undefined ? 'border-gold-500' : 'border-espresso-600'} rounded-lg px-3 py-1.5 text-cream-100 focus:outline-none focus:border-gold-400`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-cream-200 font-medium">
                        ${baseCost.toFixed(4)} <span className="text-[10px] text-cream-400 font-normal">/ {ing.unit}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {ingredients.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-cream-300">
                    No tienes ingredientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
