export default {
  enrichData: (raw) => {
    const uniteMap = Unite.data.reduce((acc, row) => {
      if (!acc[row.type_unite]) acc[row.type_unite] = [];
      acc[row.type_unite].push({
        id_unite: row.id_unite,
        nom_unite: row.nom_unite
      });
      return acc;
    }, {});

    return raw.map(row => ({
      ...row,
      unite_options: uniteMap[row.type_unite] || []
    }));
  },

  loadSousRecetteData: () => {
    const enriched = this.enrichData(Composants_sous_recette.data);
    storeValue("editSousRecetteData", enriched);
  },

  updateUnite(id, type, id_unite) {
		const table = appsmith.store.editSousRecetteData || [];

		const updated = table.map(row => {
			if (row.id === id && row.type === type) {
				const selected = row.unite_options.find(u => u.id_unite === id_unite);
				return {
					...row,
					id_unite: selected.id_unite,
					unite: selected.nom_unite
				};
			}
			return row;
		});

		storeValue("editSousRecetteData", updated);
	},


  saveToDatabase: async () => {
    const table = appsmith.store.editSousRecetteData || [];

    for (const row of table) {
      await Update.run({
        id_composant: row.id_composant,
        quantite_unite: row.quantite,
        id_unite: row.id_unite
      });
    }

    showAlert("Mise à jour réussie", "success");
  }
}
