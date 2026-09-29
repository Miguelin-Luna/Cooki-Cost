import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Settings as SettingsIcon, Trash2, Plus } from 'lucide-react';

export default function Settings() {
  const [overheads, setOverheads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOverhead, setNewOverhead] = useState({ name: '', type: 'percentage', value: 0 });

  useEffect(() => {
    loadOverheads();
  }, []);

  const loadOverheads = () => {
    api.getOverheads()
      .then(data => { setOverheads(data); setLoading(false); })
      .catch(console.error);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.createOverhead({ ...newOverhead, is_active: true });
      setNewOverhead({ name: '', type: 'percentage', value: 0 });
      loadOverheads();
    } catch(e) { console.error(e); }
  };

  const handleToggle = async (overhead) => {
    try {
      await api.updateOverhead(overhead.id, { ...overhead, is_active: !overhead.is_active });
      loadOverheads();
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteOverhead(id);
      loadOverheads();
    } catch(e) { console.error(e); }
  };

  const [aliases, setAliases] = useState([]);
  const [loadingAliases, setLoadingAliases] = useState(true);

  useEffect(() => {
    loadAliases();
  }, []);

  const loadAliases = () => {
    api.getIngredientAliases()
      .then(data => { setAliases(data); setLoadingAliases(false); })
      .catch(console.error);
  };

  const handleDeleteAlias = async (id) => {
    try {
      await api.deleteIngredientAlias(id);
      loadAliases();
    } catch(e) { console.error(e); }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-cream-100 flex items-center gap-2 mb-2">
          <SettingsIcon className="text-gold-400" /> Configuración
        </h2>
        <p className="text-cream-200 text-sm">Gestiona los costos indirectos (agua, luz, empaques extra) que se aplicarán a todas tus recetas.</p>
      </div>

      <div className="glass rounded-2xl p-6 border border-espresso-600/50">
        <h3 className="font-display font-semibold text-lg text-cream-100 mb-4">Añadir Costo Indirecto</h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-cream-300 mb-1">Nombre</label>
            <input 
              type="text" required value={newOverhead.name} onChange={e => setNewOverhead({...newOverhead, name: e.target.value})}
              placeholder="Ej: Luz y Agua"
              className="w-full bg-espresso-900/50 border border-espresso-600 rounded-xl px-4 py-2 text-cream-100 focus:outline-none focus:border-gold-500"
            />
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-xs font-medium text-cream-300 mb-1">Tipo</label>
            <select 
              value={newOverhead.type} onChange={e => setNewOverhead({...newOverhead, type: e.target.value})}
              className="w-full bg-espresso-900/50 border border-espresso-600 rounded-xl px-4 py-2 text-cream-100 focus:outline-none focus:border-gold-500"
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Fijo ($)</option>
            </select>
          </div>
          <div className="w-full sm:w-24">
            <label className="block text-xs font-medium text-cream-300 mb-1">Valor</label>
            <input 
              type="number" required min="0" step="0.01" value={newOverhead.value || ''} onChange={e => setNewOverhead({...newOverhead, value: parseFloat(e.target.value) || 0})}
              className="w-full bg-espresso-900/50 border border-espresso-600 rounded-xl px-4 py-2 text-cream-100 focus:outline-none focus:border-gold-500"
            />
          </div>
          <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            <Plus size={18} /> Añadir
          </button>
        </form>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-espresso-600/50">
        <div className="px-6 py-4 border-b border-espresso-600/50 bg-espresso-900/30">
          <h3 className="font-display font-semibold text-cream-100">Costos Indirectos Activos</h3>
        </div>
        <div className="divide-y divide-espresso-600/30">
          {loading ? (
            <div className="p-6 text-center text-cream-300 text-sm">Cargando...</div>
          ) : overheads.length === 0 ? (
            <div className="p-6 text-center text-cream-300 text-sm">No hay costos indirectos configurados.</div>
          ) : (
            overheads.map(oh => (
              <div key={oh.id} className={`p-4 flex items-center justify-between transition-colors ${oh.is_active ? 'bg-espresso-800/20' : 'opacity-50'}`}>
                <div>
                  <h4 className="font-medium text-cream-100">{oh.name}</h4>
                  <p className="text-xs text-cream-300">
                    {oh.type === 'percentage' ? `${oh.value}% del costo base` : `$${oh.value.toFixed(2)} por receta`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={oh.is_active} onChange={() => handleToggle(oh)} />
                    <div className="w-11 h-6 bg-espresso-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                  </label>
                  <button onClick={() => handleDelete(oh.id)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-espresso-600/50">
        <div className="px-6 py-4 border-b border-espresso-600/50 bg-espresso-900/30">
          <h3 className="font-display font-semibold text-cream-100">Asociaciones Aprendidas (IA)</h3>
          <p className="text-xs text-cream-300 mt-1">CookiCost asocia automáticamente estos nombres extraídos de fotos con tus ingredientes.</p>
        </div>
        <div className="divide-y divide-espresso-600/30">
          {loadingAliases ? (
            <div className="p-6 text-center text-cream-300 text-sm">Cargando...</div>
          ) : aliases.length === 0 ? (
            <div className="p-6 text-center text-cream-300 text-sm">No hay asociaciones guardadas aún.</div>
          ) : (
            aliases.map(alias => (
              <div key={alias.id} className="p-4 flex items-center justify-between transition-colors bg-espresso-800/20">
                <div>
                  <h4 className="font-medium text-cream-100">"{alias.alias_name}"</h4>
                  <p className="text-xs text-cream-300">
                    Asociado a: Ingrediente ID #{alias.ingredient_id}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleDeleteAlias(alias.id)} className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
