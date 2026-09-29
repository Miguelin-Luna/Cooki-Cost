const API_BASE = '/api/v1';

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  } else {
    // Delete Content-Type for FormData so the browser automatically sets it with the boundary
    delete headers['Content-Type'];
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    let errorMsg = 'API request failed';
    const textData = await response.text();
    try {
      if (textData) {
        const errorData = JSON.parse(textData);
        errorMsg = errorData.detail || errorMsg;
      }
    } catch {
      errorMsg = textData || errorMsg;
    }
    throw new Error(errorMsg);
  }
  
  // 204 No Content (DELETE responses)
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

export const api = {
  // Ingredients
  getIngredients: () => fetchApi('/ingredients'),
  createIngredient: (data) => fetchApi('/ingredients', { method: 'POST', body: JSON.stringify(data) }),
  updateIngredient: (id, data) => fetchApi(`/ingredients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  bulkUpdateIngredients: (data) => fetchApi('/ingredients/bulk-update', { method: 'PUT', body: JSON.stringify(data) }),
  deleteIngredient: (id) => fetchApi(`/ingredients/${id}`, { method: 'DELETE' }),
  createIngredientAlias: (data) => fetchApi('/ingredients/aliases', { method: 'POST', body: JSON.stringify(data) }),
  getIngredientAliases: () => fetchApi('/ingredients/aliases'),
  deleteIngredientAlias: (id) => fetchApi(`/ingredients/aliases/${id}`, { method: 'DELETE' }),

  // Recipes
  getRecipes: () => fetchApi('/recipes'),
  getRecipe: (id) => fetchApi(`/recipes/${id}`),
  createRecipe: (data) => fetchApi('/recipes', { method: 'POST', body: JSON.stringify(data) }),
  updateRecipe: (id, data) => fetchApi(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRecipe: (id) => fetchApi(`/recipes/${id}`, { method: 'DELETE' }),
  duplicateRecipe: (id, newName) => fetchApi(`/recipes/${id}/duplicate?new_name=${encodeURIComponent(newName || 'Copia')}`, { method: 'POST' }),
  uploadRecipeImage: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi(`/recipes/${id}/image`, {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type so browser sets it with boundary
        'Content-Type': undefined
      }
    });
  },
  parseRecipeImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi(`/recipes/parse-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': undefined
      }
    });
  },
  
  // Overheads
  getOverheads: () => fetchApi('/overheads'),
  createOverhead: (data) => fetchApi('/overheads', { method: 'POST', body: JSON.stringify(data) }),
  updateOverhead: (id, data) => fetchApi(`/overheads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOverhead: (id) => fetchApi(`/overheads/${id}`, { method: 'DELETE' }),
};

