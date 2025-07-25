export default {
  init: async () => {
    const idSR = appsmith.URL.queryParams.SRId;
    await GetSousRecetteById.run({ id_sous_recette: idSR });
    await GetComposantsBySousRecette.run({ id_sous_recette: idSR });

    this.enrichData();
  },

  enrichData: () => {
    const raw = GetComposantsBySousRecette.data || [];
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

  updateQuantite: (id, newQty) => {
		const table = appsmith.store.tmpTable || [];

		const updated = table.map(row => {
			const match =
				(row.id_composant && row.id_composant === id) ||
				(!row.id_composant && row.id_matiere_premiere === id);

			if (match) {
				const quantite_en_base = newQty * row.facteur_conversion;
				const cout_total = quantite_en_base * row.cout_unitaire;

				return {
					...row,
					quantite: newQty,
					quantite_en_base,
					cout_total
				};
			}
			return row;
		});

		storeValue("tmpTable", updated);
	},

  updateUnite: (id, newUniteId) => {
		const table = appsmith.store.tmpTable || [];
		const unites = Unite.data;
		const newUnite = unites.find(u => u.id_unite === newUniteId);

		const updated = table.map(row => {
			const match =
				(row.id_composant && row.id_composant === id) ||
				(!row.id_composant && row.id_matiere_premiere === id);

			if (match && newUnite) {
				const facteur = newUnite.facteur_conversion;
				const quantite_en_base = row.quantite * facteur;
				const cout_total = quantite_en_base * row.cout_unitaire;

				return {
					...row,
					id_unite: newUnite.id_unite,
					unite: newUnite.nom_unite,
					facteur_conversion: facteur,
					quantite_en_base,
					cout_total
				};
			}
			return row;
		});

		storeValue("tmpTable", updated);
	},

  getTotalCost: () => {
    const table = appsmith.store.tmpTable || [];
    return table.reduce((sum, row) => sum + (row.cout_total || 0), 0);
  },

	addMatiere: () => {
		const selectedId = Select_matiere_premiere.selectedOptionValue;
		if (!selectedId) return;

		const table = appsmith.store.tmpTable || [];

		// Kiểm tra đã tồn tại chưa
		const exists = table.some(
			item =>
				item.id_matiere_premiere === selectedId &&
				(!item.id_composant || item.id_composant === null)
		);
		if (exists) {
			showAlert("Cet ingrédient a déjà été ajouté", "info");
			return;
		}

		const selectedLabel = Select_matiere_premiere.selectedOptionLabel;
		const matiere = Get_matiere_unites.data.find(m => m.id_matiere_premiere === selectedId);
		const uniteList = Unite.data.filter(u => u.type_unite === matiere.type_unite);

		const newRow = {
			id_composant: null, // Vì chưa lưu vào DB
			id_sous_recette: appsmith.URL.queryParams.SRId,
			id_matiere_premiere: selectedId,
			nom: selectedLabel,
			quantite: null,
			id_unite: matiere.id_unite,
			unite: matiere.nom_unite,
			type_unite: matiere.type_unite,
			unite_options: uniteList,
			facteur_conversion: matiere.facteur_conversion || 1,
			prix_achat_ht: matiere.prix_achat_ht,
			quantite_unitaire: matiere.quantite_unite,
			quantite_en_base: 0,
			cout_unitaire:
				matiere.quantite_unite > 0
					? matiere.prix_achat_ht / matiere.quantite_unite
					: 0,
			cout_total: 0
		};

		storeValue("tmpTable", [...table, newRow]);
	},
	
	deleteRow: (id) => {
		const table = appsmith.store.tmpTable || [];

		const updated = table.filter(row => {
			const match =
				(row.id_composant && row.id_composant === id) ||
				(!row.id_composant && row.id_matiere_premiere === id);
			return !match;
		});

		storeValue("tmpTable", updated);
	},
	
  saveToDatabase: async () => {
		const table = appsmith.store.tmpTable || [];
		const idSR = appsmith.URL.queryParams.SRId;
		
		const invalids = table.filter(row => !row.quantite || row.quantite <= 0);
		if (invalids.length > 0) {
			showAlert("Veuillez saisir une quantité valide (> 0) pour tous les ingrédients", "error");
			return;
		}
		
		await UpdateSousRecette.run({
			id_sous_recette: idSR,
			nom: Input_nom.text,
			description: Input_description.text,
			quantite_produit: Input_quantite.text,
			id_unite: Select_unite.selectedOptionValue
		});

		for (const row of table) {
			if (row.id_composant) {
				await Update_composants.run({
					id_composant: row.id_composant,
					quantite_unite: row.quantite,
					id_unite: row.id_unite
				});
			} else {
				await Insert_composants_SR.run({
					id_sous_recette: idSR,
					id_matiere_premiere: row.id_matiere_premiere,
					quantite_unite: row.quantite,
					id_unite: row.id_unite
				});
			}
		}

		const composantsOriginaux = GetComposantsBySousRecette.data || [];
		const ids_keep = table.map(r => r.id_composant).filter(id => id != null);
		const ids_delete = composantsOriginaux
			.map(r => r.id_composant)
			.filter(id => !ids_keep.includes(id));

		for (const id_composant of ids_delete) {
			await Delete_composant_SR.run({ id_composant });
		}

		showAlert("Mise à jour réussie", "success");
		//reload
		await JSObject1.init();
	}
};
