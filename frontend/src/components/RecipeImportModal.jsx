import { useState, useRef, useEffect } from 'react';
import { Upload, X, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { api } from '../api/client';

export default function RecipeImportModal({ isOpen, onClose, onConfirm }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Loading, 3: Review
  const [file, setFile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("La imagen supera el tamaño máximo de 5MB");
        return;
      }
      setFile(selectedFile);
      processImage(selectedFile);
    }
  };

  const processImage = async (imageFile) => {
    setStep(2);
    setError(null);
    try {
      const result = await api.parseRecipeImage(imageFile);
      setDraft(result);
      setStep(3);
    } catch (err) {
      setError(err.message || "Error procesando la imagen. Revisa la consola.");
      setStep(1);
    }
  };

  const handleUpdateIngredient = (index, field, value) => {
    const newDraft = { ...draft };
    newDraft.ingredients[index] = {
      ...newDraft.ingredients[index],
      [field]: field === 'normalized_quantity' ? (parseFloat(value) || 0) : value
    };
    
    // Auto clear warning if they mapped it
    if (field === 'ingredient_id' && value) {
       newDraft.ingredients[index].needs_review = false;
    }
    
    setDraft(newDraft);
  };

  const handleConfirm = async () => {
    // Check if any ingredients still need review or have no ID
    const unmapped = draft.ingredients.filter(i => !i.ingredient_id);
    if (unmapped.length > 0) {
      if (!window.confirm("Hay ingredientes sin mapear en tu base de datos. Se ignorarán o deberás asignarlos después en el formulario. ¿Continuar?")) {
        return;
      }
    }
    
    // Save any aliases requested
    for (const ing of draft.ingredients) {
      if (ing.ingredient_id && ing.save_alias) {
        try {
          await api.createIngredientAlias({
            alias_name: ing.detected_name,
            ingredient_id: ing.ingredient_id
          });
        } catch (e) {
          console.error("Error saving alias", e);
        }
      }
    }
    
    const formattedData = {
      name: draft.recipe_name || 'Nueva Receta',
      yield_quantity: draft.recipe_yield || '',
      yield_unit: 'galleta(s)',
      category: '',
      protection_margin: 5,
      profit_margin: 30,
      ingredients: draft.ingredients.map(i => ({
        ingredient_id: i.ingredient_id || '',
        quantity: i.normalized_quantity || i.quantity || 0,
        unit: i.normalized_unit || i.unit || 'g',
        _raw: i.ingredient_id ? null : i.source_text
      }))
    };
    
    onConfirm(formattedData, file);
    reset();
  };

  const reset = () => {
    setStep(1);
    setFile(null);
    setDraft(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/80 backdrop-blur-sm">
      <div className="bg-espresso-900 border border-espresso-600 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        <div className="flex justify-between items-center p-6 border-b border-espresso-600/50">
          <h2 className="text-xl font-display font-bold text-cream-100">
            {step === 1 && "Importar Receta desde Foto"}
            {step === 2 && "Analizando Imagen..."}
            {step === 3 && "Revisar Borrador de Receta"}
          </h2>
          <button onClick={reset} className="text-cream-300 hover:text-cream-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose/10 border border-rose/30 flex items-start gap-3">
              <AlertTriangle className="text-rose shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-cream-100">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-espresso-600 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gold-500 hover:bg-espresso-800/50 transition-all group"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleFileSelect}
              />
              <Upload size={48} className="text-espresso-600 mb-4 group-hover:text-gold-500 transition-colors" />
              <p className="text-lg font-medium text-cream-200 mb-2">Haz clic para subir una foto</p>
              <p className="text-sm text-cream-400">Formatos soportados: JPG, PNG, WEBP (Max 5MB)</p>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={48} className="text-gold-500 animate-spin mb-6" />
              <p className="text-lg font-medium text-cream-200">La IA está leyendo tu receta...</p>
              <p className="text-sm text-cream-400 mt-2">Identificando ingredientes, normalizando fracciones y cruzando datos con tu inventario.</p>
            </div>
          )}

          {step === 3 && draft && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-cream-200 mb-1">Nombre de receta (detectado)</label>
                  <input 
                    type="text" 
                    value={draft.recipe_name || ''} 
                    onChange={e => setDraft({...draft, recipe_name: e.target.value})}
                    className="w-full bg-espresso-800 border border-espresso-600 rounded-lg px-4 py-2 text-cream-100 focus:border-gold-500 focus:outline-none"
                    placeholder="Ej. Galletas Kinder Bueno"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-cream-200 mb-1">Rendimiento (Yield) detectado</label>
                  <input 
                    type="number" 
                    value={draft.recipe_yield || ''} 
                    onChange={e => setDraft({...draft, recipe_yield: parseFloat(e.target.value) || null})}
                    className="w-full bg-espresso-800 border border-espresso-600 rounded-lg px-4 py-2 text-cream-100 focus:border-gold-500 focus:outline-none"
                    placeholder="No detectado"
                  />
                  {!draft.recipe_yield && <p className="text-[10px] text-gold-400 mt-1">⚠ No se detectó el rendimiento. Deberás ingresarlo luego.</p>}
                </div>
              </div>

              <div className="border border-espresso-600 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-cream-300 uppercase bg-espresso-800/80">
                    <tr>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Texto Original</th>
                      <th className="px-4 py-3 w-24">Cantidad</th>
                      <th className="px-4 py-3 w-24">Unidad</th>
                      <th className="px-4 py-3">Producto en Base de Datos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-espresso-600/30">
                    {draft.ingredients.map((ing, idx) => (
                      <tr key={idx} className={ing.needs_review ? "bg-rose/5" : "bg-espresso-900/30"}>
                        <td className="px-4 py-3">
                          {ing.needs_review ? (
                            <div className="flex flex-col gap-1 text-rose" title={ing.review_reason}>
                              <div className="flex items-center gap-1">
                                <AlertTriangle size={16} /> <span className="text-xs font-medium">
                                  {ing.review_reason === 'fuzzy_match' ? `Sugerencia automática (${(ing.match_confidence * 100).toFixed(0)}%)` : 'Revisar'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-leaf">
                              <Check size={16} /> <span className="text-xs font-medium">
                                {ing.review_reason === 'alias_match' ? 'Asociación habitual' : 'Match exacto'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-cream-200 font-medium text-xs leading-tight">{ing.source_text}</p>
                          <p className="text-[10px] text-cream-400 mt-1">Extraído: {ing.detected_name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" step="0.01"
                            value={ing.normalized_quantity || ing.quantity || ''}
                            onChange={(e) => handleUpdateIngredient(idx, 'normalized_quantity', e.target.value)}
                            className="w-full bg-espresso-800 border border-espresso-600 focus:border-gold-500 focus:outline-none rounded px-2 py-1 text-cream-100"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="text" 
                            value={ing.normalized_unit || ing.unit || ''}
                            onChange={(e) => handleUpdateIngredient(idx, 'normalized_unit', e.target.value)}
                            className="w-full bg-espresso-800 border border-espresso-600 focus:border-gold-500 focus:outline-none rounded px-2 py-1 text-cream-100"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <RecipeIngredientSelect 
                            value={ing.ingredient_id || ''}
                            onChange={(val) => handleUpdateIngredient(idx, 'ingredient_id', parseInt(val))}
                          />
                          {(ing.ingredient_id && (ing.needs_review || ing.save_alias !== undefined)) && (
                            <div className="mt-2 flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                id={`save_alias_${idx}`} 
                                checked={ing.save_alias || false} 
                                onChange={e => handleUpdateIngredient(idx, 'save_alias', e.target.checked)} 
                                className="rounded bg-espresso-900 border-espresso-600 text-gold-500 focus:ring-gold-500"
                              />
                              <label htmlFor={`save_alias_${idx}`} className="text-xs text-cream-200 cursor-pointer">
                                ¿Recordar esta asociación?
                              </label>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {step === 3 && (
          <div className="p-6 border-t border-espresso-600/50 bg-espresso-900 flex justify-between items-center">
            <p className="text-sm text-cream-300">
              {draft.ingredients.filter(i => i.needs_review).length > 0 
                ? <span className="text-rose font-medium">⚠ {draft.ingredients.filter(i => i.needs_review).length} ingredientes requieren revisión</span>
                : <span className="text-leaf font-medium">✓ Todos los ingredientes están listos</span>
              }
            </p>
            <div className="flex gap-3">
              <button onClick={reset} className="px-4 py-2 text-cream-300 hover:text-cream-100 transition-colors">Cancelar</button>
              <button 
                onClick={handleConfirm}
                className="px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-espresso-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-gold-500/20 transition-all"
              >
                Confirmar Borrador
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Helper para seleccionar ingredientes
function RecipeIngredientSelect({ value, onChange }) {
  const [ingredients, setIngredients] = useState([]);
  
  useEffect(() => {
    api.getIngredients().then(setIngredients).catch(console.error);
  }, []);

  return (
    <select 
      value={value} 
      onChange={e => onChange(e.target.value)}
      className="w-full bg-espresso-800 border border-espresso-600 focus:border-gold-500 focus:outline-none rounded px-2 py-1 text-cream-100 text-sm"
    >
      <option value="">-- Seleccionar Producto --</option>
      {ingredients.map(ing => (
        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
      ))}
    </select>
  );
}
