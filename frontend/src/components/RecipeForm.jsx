import { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, ClipboardPaste } from 'lucide-react';
import { useRef } from 'react';
import { api } from '../api/client';

export default function RecipeForm({ initialData, onSubmit, onCancel }) {
  const [ingredients, setIngredients] = useState([]);
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        ...initialData,
        ingredients: (initialData.ingredients || []).map(i => ({
          ingredient_id: i.ingredient_id || i.ingredient?.id || '',
          quantity: i.quantity || 0,
          unit: i.unit || 'g',
          _raw: i._raw
        }))
      };
    }
    return {
      name: '',
      yield_quantity: '',
      yield_unit: 'galleta(s)',
      category: '',
      protection_margin: 5,
      profit_margin: 30,
      ingredients: []
    };
  });
  const [imageFile, setImageFile] = useState(initialData?.imageFile || null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.imageFile 
      ? URL.createObjectURL(initialData.imageFile) 
      : (initialData?.image_url || null)
  );
  const [showParseBox, setShowParseBox] = useState(false);
  const [parseText, setParseText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.getIngredients().then(setIngredients).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredient_id: '', quantity: 0, unit: 'g' }]
    }));
  };

  const updateRecipeIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { 
      ...newIngredients[index], 
      [field]: field === 'quantity' ? (parseFloat(value) || 0) : value 
    };
    
    // Auto-set unit if ingredient_id changes and clear _raw
    if (field === 'ingredient_id') {
      const ing = ingredients.find(i => i.id === parseInt(value));
      if (ing) {
        if (!newIngredients[index].unit) {
          newIngredients[index].unit = ing.unit;
        }
        newIngredients[index]._raw = null; // Clear error warning on successful manual link
      }
    }
    
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validIngredients = formData.ingredients.filter(ing => ing.ingredient_id);
    onSubmit({
      ...formData,
      ingredients: validIngredients.map(i => ({
        ...i,
        ingredient_id: parseInt(i.ingredient_id)
      }))
    }, imageFile);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleParseText = async () => {
    if (!parseText.trim()) return;
    setIsParsing(true);
    try {
      const response = await fetch('/api/v1/recipes/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: parseText })
      });
      const data = await response.json();
      
      const newIngredients = data.items.map(item => ({
        ingredient_id: item.ingredient_id || '',
        quantity: item.quantity || 0,
        unit: item.unit || 'g',
        _raw: item.ingredient_id ? null : item.raw_name // hint if not found
      }));
      
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ...newIngredients]
      }));
      setParseText('');
      setShowParseBox(false);
    } catch (e) {
      console.error(e);
      alert('Error procesando el texto');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-cream-200 mb-1">Nombre de la Receta</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            className="w-full bg-espresso-800 border border-espresso-600 rounded-lg px-4 py-2 text-cream-100 focus:outline-none focus:border-gold-500 transition-colors"
            required
            placeholder="Ej. Galletas Choco-Chips"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-cream-200 mb-1">Categoría (Opcional)</label>
          <select
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            className="w-full bg-espresso-800 border border-espresso-600 rounded-lg px-4 py-2 text-cream-100 focus:outline-none focus:border-gold-500 transition-colors"
          >
            <option value="">Ninguna</option>
            <option value="Cookies">Cookies</option>
            <option value="Brownies">Brownies</option>
            <option value="Pasteles">Pasteles</option>
            <option value="Panadería">Panadería</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
        <div className="md:col-span-2 flex items-center gap-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 shrink-0 rounded-xl bg-espresso-800 border-2 border-dashed border-espresso-600 hover:border-gold-500 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative group"
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/jpeg, image/png, image/webp" 
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <ImageIcon size={24} className="text-espresso-600 group-hover:text-gold-500" />
            )}
          </div>
          <div className="text-sm text-cream-300">
            <p className="font-medium text-cream-200">Foto de la receta (Opcional)</p>
            <p className="text-xs">Recomendado: formato cuadrado, máx 2MB.</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gold-400 text-xs mt-1 hover:underline">
              {imagePreview ? 'Cambiar imagen' : 'Seleccionar archivo'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-cream-200 mb-1">Rinde (Cantidad)</label>
          <input 
            type="number" name="yield_quantity" value={formData.yield_quantity || ''} onChange={handleChange} required min="1" step="0.1"
            className="w-full bg-espresso-900/50 border border-espresso-600 rounded-xl px-4 py-2 text-cream-100 focus:outline-none focus:border-gold-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-cream-200 mb-1">Unidad de rendimiento</label>
          <input 
            type="text" name="yield_unit" value={formData.yield_unit} onChange={handleChange} required 
            className="w-full bg-espresso-900/50 border border-espresso-600 rounded-xl px-4 py-2 text-cream-100 focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      <div className="border-t border-espresso-600/50 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-display font-medium text-gold-400">Ingredientes</h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowParseBox(!showParseBox)} className="text-xs flex items-center gap-1 bg-espresso-800 border border-espresso-600 hover:bg-espresso-700 text-cream-200 px-3 py-1.5 rounded-lg transition-colors">
              <ClipboardPaste size={14} /> Pegar Texto
            </button>
            <button type="button" onClick={addIngredient} className="text-xs flex items-center gap-1 bg-espresso-700 hover:bg-espresso-600 px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={14} /> Añadir
            </button>
          </div>
        </div>

        {showParseBox && (
          <div className="mb-4 bg-espresso-900/50 p-3 rounded-xl border border-espresso-600/50 fade-in">
            <p className="text-xs text-cream-300 mb-2">Pega la receta aquí (ej. "1 taza de harina", "2 cdas de azucar"):</p>
            <textarea 
              value={parseText}
              onChange={e => setParseText(e.target.value)}
              rows={4}
              className="w-full bg-espresso-800 border border-espresso-600 rounded-lg px-3 py-2 text-sm text-cream-100 focus:outline-none focus:border-gold-500 mb-2"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowParseBox(false)} className="px-3 py-1.5 text-xs text-cream-300 hover:bg-espresso-700 rounded-lg">Cancelar</button>
              <button type="button" onClick={handleParseText} disabled={isParsing} className="px-3 py-1.5 text-xs bg-gold-500 text-espresso-900 font-medium rounded-lg hover:bg-gold-400 disabled:opacity-50 flex items-center gap-1">
                {isParsing ? 'Procesando...' : 'Autocompletar'}
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {formData.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1">
                <select 
                  required value={ing.ingredient_id} onChange={e => updateRecipeIngredient(i, 'ingredient_id', e.target.value)}
                  className="w-full bg-espresso-900/50 border border-espresso-600 rounded-lg px-3 py-2 text-sm text-cream-100 focus:outline-none focus:border-gold-500"
                >
                  <option value="">Seleccione ingrediente...</option>
                  {ingredients.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name} ({opt.brand || 'Sin marca'})</option>
                  ))}
                </select>
                {ing._raw && <p className="text-[10px] text-gold-400 mt-1 ml-1">No encontrado: {ing._raw}</p>}
              </div>
              <div className="w-24">
                <input 
                  type="number" required min="0" step="0.01" value={ing.quantity || ''} onChange={e => updateRecipeIngredient(i, 'quantity', e.target.value)} placeholder="Cant"
                  className="w-full bg-espresso-900/50 border border-espresso-600 rounded-lg px-3 py-2 text-sm text-cream-100 focus:outline-none focus:border-gold-500"
                />
              </div>
              <div className="w-20">
                <input 
                  type="text" required value={ing.unit} onChange={e => updateRecipeIngredient(i, 'unit', e.target.value)} placeholder="Unidad"
                  className="w-full bg-espresso-900/50 border border-espresso-600 rounded-lg px-3 py-2 text-sm text-cream-100 focus:outline-none focus:border-gold-500"
                />
              </div>
              <button type="button" onClick={() => removeIngredient(i)} className="p-2 text-danger hover:bg-danger/10 rounded-lg mt-0.5 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {formData.ingredients.length === 0 && (
            <div className="text-center py-4 text-cream-300 text-sm italic">
              No hay ingredientes añadidos. ¡Haz clic en "Añadir Ingrediente"!
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-3 pt-4">
        {/* Validation Errors */}
        {(formData.ingredients.length === 0 || formData.ingredients.some(ing => !ing.ingredient_id || !ing.quantity || ing.quantity <= 0) || !formData.yield_quantity || formData.yield_quantity <= 0) && (
          <div className="text-right text-xs text-danger mb-1">
            <p className="font-bold mb-1">⚠ No se puede guardar:</p>
            {!formData.yield_quantity || formData.yield_quantity <= 0 ? <p>• Rinde requerido (mayor a 0)</p> : null}
            {formData.ingredients.length === 0 ? <p>• Añade al menos un ingrediente</p> : null}
            {formData.ingredients.some(ing => !ing.ingredient_id) ? <p>• Faltan productos por vincular</p> : null}
            {formData.ingredients.some(ing => !ing.quantity || ing.quantity <= 0) ? <p>• Hay ingredientes con cantidad 0 o vacía</p> : null}
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-medium text-cream-200 hover:text-cream-100 transition-colors">Cancelar</button>
          <button 
            type="submit" 
            disabled={formData.ingredients.length === 0 || formData.ingredients.some(ing => !ing.ingredient_id || !ing.quantity || ing.quantity <= 0) || !formData.yield_quantity || formData.yield_quantity <= 0} 
            className="px-5 py-2 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 text-espresso-900 font-bold rounded-xl shadow-lg hover:shadow-gold-500/25 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar Receta
          </button>
        </div>
      </div>
    </form>
  );
}
