import { useState } from 'react';

const UNITS = ['g', 'kg', 'ml', 'l', 'unidad', 'funda', 'lb', 'oz'];

export default function IngredientForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    brand: '',
    unit: 'g',
    package_quantity: 0,
    package_cost: 0,
    conversions: []
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddConversion = () => {
    setFormData(prev => ({
      ...prev,
      conversions: [...(prev.conversions || []), { unit_name: 'taza', equivalent_in_grams: 0 }]
    }));
  };

  const handleRemoveConversion = (index) => {
    setFormData(prev => ({
      ...prev,
      conversions: prev.conversions.filter((_, i) => i !== index)
    }));
  };

  const handleConversionChange = (index, field, value) => {
    setFormData(prev => {
      const newConversions = [...prev.conversions];
      newConversions[index] = {
        ...newConversions[index],
        [field]: field === 'equivalent_in_grams' ? parseFloat(value) || 0 : value
      };
      return { ...prev, conversions: newConversions };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate conversions
    if (formData.conversions?.some(c => c.equivalent_in_grams <= 0)) {
      alert("Todas las equivalencias deben ser mayores a 0");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-cream-200 mb-1">Nombre</label>
        <input 
          type="text" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          className="w-full bg-espresso-900/50 border border-espresso-600 rounded-xl px-4 py-2 text-cream-100 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
          placeholder="Ej: Harina de trigo"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-cream-200 mb-1">Marca (Opcional)</label>
        <input 
          type="text" 
          name="brand" 
          value={formData.brand || ''} 
          onChange={handleChange} 
          className="w-full bg-espresso-900/50 border border-espresso-600 rounded-xl px-4 py-2 text-cream-100 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
          placeholder="Ej: King Arthur"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-cream-200 mb-1">Cantidad del empaque</label>
          <input 
            type="number" 
            name="package_quantity" 
            value={formData.package_quantity || ''} 
            onChange={handleChange} 
            required 
            min="0.01"
            step="0.01"
            className="w-full bg-espresso-900/50 border border-espresso-600 rounded-xl px-4 py-2 text-cream-100 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-cream-200 mb-1">Unidad</label>
          <select 
            name="unit" 
            value={formData.unit} 
            onChange={handleChange}
            className="w-full bg-espresso-900/50 border border-espresso-600 rounded-xl px-4 py-2 text-cream-100 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
          >
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-cream-200 mb-1">Costo del empaque ($)</label>
        <input 
          type="number" 
          name="package_cost" 
          value={formData.package_cost || ''} 
          onChange={handleChange} 
          required 
          min="0"
          step="0.01"
          className="w-full bg-espresso-900/50 border border-espresso-600 rounded-xl px-4 py-2 text-cream-100 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
        />
      </div>

      <div className="pt-2 border-t border-espresso-700">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-cream-200">Equivalencias Avanzadas (Opcional)</label>
          <button type="button" onClick={handleAddConversion} className="text-xs text-gold-500 hover:text-gold-400 font-medium">+ Agregar regla</button>
        </div>
        <p className="text-xs text-cream-300 mb-3">Si este ingrediente se mide por volumen (taza, cda) o por pieza, define cuántos gramos pesa.</p>
        
        {formData.conversions?.map((conv, index) => (
          <div key={index} className="flex gap-2 mb-2 items-center">
            <span className="text-sm text-cream-300">1</span>
            <select
              value={conv.unit_name}
              onChange={(e) => handleConversionChange(index, 'unit_name', e.target.value)}
              className="bg-espresso-900/50 border border-espresso-600 rounded-lg px-2 py-1.5 text-cream-100 text-sm flex-1"
            >
              {['taza', 'cucharada', 'cucharadita', 'unidad'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <span className="text-sm text-cream-300">equivale a</span>
            <input
              type="number"
              value={conv.equivalent_in_grams || ''}
              onChange={(e) => handleConversionChange(index, 'equivalent_in_grams', e.target.value)}
              placeholder="Gramos"
              min="0.01"
              step="0.01"
              className="bg-espresso-900/50 border border-espresso-600 rounded-lg px-2 py-1.5 text-cream-100 text-sm w-24"
            />
            <span className="text-sm text-cream-300">g</span>
            <button type="button" onClick={() => handleRemoveConversion(index)} className="text-rose hover:text-rose/80 ml-1">✕</button>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-cream-200 hover:bg-espresso-700 transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-espresso-900 font-semibold hover:shadow-lg hover:shadow-gold-500/20 transition-all duration-300"
        >
          {initialData ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
