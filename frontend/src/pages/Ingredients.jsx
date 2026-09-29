import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import Modal from '../components/Modal';
import IngredientForm from '../components/IngredientForm';

export default function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = () => {
    api.getIngredients().then(setIngredients).catch(console.error);
  };

  const handleSave = async (data) => {
    try {
      if (editingItem) {
        await api.updateIngredient(editingItem.id, data);
      } else {
        await api.createIngredient(data);
      }
      setIsModalOpen(false);
      loadIngredients();
    } catch (e) {
      console.error(e);
      alert('Error guardando ingrediente');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Seguro que deseas eliminar este ingrediente?')) {
      try {
        await api.deleteIngredient(id);
        loadIngredients();
      } catch (e) {
        alert('Error eliminando. Puede que esté en uso en alguna receta.');
      }
    }
  };

  const filtered = ingredients.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    (i.brand && i.brand.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-display font-bold text-cream-100">Ingredientes</h2>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="px-4 py-2 bg-gold-500 hover:bg-gold-400 text-espresso-900 rounded-xl text-sm font-semibold shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Nuevo Ingrediente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-300" size={18} />
        <input 
          type="text" 
          placeholder="Buscar ingredientes..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-espresso-800/80 border border-espresso-600 rounded-xl text-cream-100 placeholder:text-cream-300/50 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all backdrop-blur-md"
        />
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-espresso-600/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-cream-300 uppercase bg-espresso-900/50 border-b border-espresso-600/50">
              <tr>
                <th className="px-6 py-4 font-medium">Nombre</th>
                <th className="px-6 py-4 font-medium">Empaque</th>
                <th className="px-6 py-4 font-medium">Costo Empaque</th>
                <th className="px-6 py-4 font-medium">Costo x Unidad</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso-600/30">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-espresso-700/20 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-cream-100">{item.name}</p>
                    {item.brand && <p className="text-xs text-cream-300">{item.brand}</p>}
                  </td>
                  <td className="px-6 py-4 text-cream-200">{item.package_quantity} {item.unit}</td>
                  <td className="px-6 py-4 text-cream-200">${item.package_cost.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="bg-espresso-900 px-2 py-1 rounded text-gold-400 font-medium">
                      ${item.cost_per_unit.toFixed(4)} / {item.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1.5 text-cream-300 hover:text-gold-400 hover:bg-espresso-700 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-cream-300 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-cream-300">
                    No se encontraron ingredientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}>
        <IngredientForm initialData={editingItem} onSubmit={handleSave} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
