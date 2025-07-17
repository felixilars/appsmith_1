export default {
  enrichData: () => {
    const raw = Composants_sous_recette.data;
    const unites = Unite.data;

    const uniteMap = unites.reduce((acc, row) => {
      if (!acc[row.type_unite]) acc[row.type_unite] = [];
      acc[row.type_unite].push({
        id_unite: row.id_unite,
        nom_unite: row.nom_unite,
        facteur_conversion: row.facteur_conversion
      });
      return acc;
    }, {});

    const enriched = raw.map(row => {
      const uniteOptions = uniteMap[row.type_unite] || [];
      const unite_courante = unites.find(u => u.id_unite === row.id_unite);
      const facteur_courant = unite_courante?.facteur_conversion || 1;

      const quantite_en_base = row.quantite_unite * facteur_courant;
      const cout_unitaire = row.quantite_unitaire > 0 ? row.prix_achat_ht / row.quantite_unitaire : 0;
      const cout_total = quantite_en_base * cout_unitaire;

      return {
        id_composant: row.id_composant,
        id_sous_recette: row.id_sous_recette,
        id_matiere_premiere: row.id_matiere_premiere,
        nom: row.nom_matiere,
        quantite: row.quantite_unite,
        id_unite: row.id_unite,
        unite: row.nom_unite,
        type_unite: row.type_unite,
        unite_options: uniteOptions,
        facteur_conversion: facteur_courant,
        prix_achat_ht: row.prix_achat_ht,
        quantite_unitaire: row.quantite_unitaire,
        quantite_en_base,
        cout_unitaire,
        cout_total
      };
    });

    storeValue("tmpTable", enriched);
  },

  updateQuantite: (id_composant, newQty) => {
    const table = appsmith.store.tmpTable || [];
    const updated = table.map(row => {
      if (row.id_composant === id_composant) {
        const quantite_en_base = newQty * row.facteur_conversion;
        const cout_unitaire = row.quantite_unitaire > 0 ? row.prix_achat_ht / row.quantite_unitaire : 0;
        const cout_total = quantite_en_base * cout_unitaire;

        return {
          ...row,
          quantite: newQty,
          quantite_en_base,
          cout_unitaire,
          cout_total
        };
      }
      return row;
    });

    storeValue("tmpTable", updated);
  },

  updateUnite: (id_composant, id_unite_moi) => {
		const table = appsmith.store.tmpTable || [];
		const unites = Unite.data;

		const updated = table.map(row => {
			if (row.id_composant !== id_composant) return row;

			const unite_moi = unites.find(u => u.id_unite === id_unite_moi);
			if (!unite_moi) return row;

			const facteur = unite_moi.facteur_conversion;

			const quantite_en_base = row.quantite * facteur;
			const cout_unitaire = row.quantite_unitaire > 0 ? row.prix_achat_ht / row.quantite_unitaire : 0;
			const cout_total = quantite_en_base * cout_unitaire;

			return {
				...row,
				id_unite: id_unite_moi,
				unite: unite_moi.nom_unite,
				facteur_conversion: facteur,
				quantite_en_base,
				cout_unitaire,
				cout_total
			};
		});

		storeValue("tmpTable", updated);
	},

  getTotalCost: () => {
    const table = appsmith.store.tmpTable || [];
    return table.reduce((sum, row) => sum + (row.cout_total || 0), 0);
  },

  saveToDatabase: async () => {
    const table = appsmith.store.tmpTable || [];

    for (const row of table) {
      await Update_composants.run({
        id_composant: row.id_composant,
        quantite_unite: row.quantite,
        id_unite: row.id_unite
      });
    }

    showAlert("Mise à jour réussie", "success");
  }
};
