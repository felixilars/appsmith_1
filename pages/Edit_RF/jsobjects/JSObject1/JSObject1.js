export default {
  init: async () => {
    const recetteId = appsmith.URL.queryParams.recetteId;
    await Get_Recette_By_Id.run({ id: recetteId });
    await Table_ingredients.run({ recetteId });

    const data = this.enrichData(Table_ingredients.data);
    storeValue("editRecetteFinaleData", data);
    storeValue("editRecetteMeta", Get_Recette_By_Id.data[0]);
  },

  enrichData: (raw) => {
    const uniteMap = Unites.data.reduce((acc, row) => {
      if (!acc[row.type_unite]) acc[row.type_unite] = [];
      acc[row.type_unite].push({
        id_unite: row.id_unite,
        nom_unite: row.nom_unite
      });
      return acc;
    }, {});

    return raw.map(row => ({
      id_composant: row.id_composant,
      nom: row.nom_composant,
      type: row.type_composant,
      quantite: row.quantite_unite,
      id_unite: row.id_unite,
      unite: row.nom_unite,
      type_unite: row.type_unite,
      prix_achat_ht: row.prix_achat_ht,
      quantite_unitaire: row.quantite_unitaire,
      cout_unitaire: row.cout_unitaire,
      cout_total: row.cout_total,
      unite_options: uniteMap[row.type_unite] || []
    }));
  },

  updateQuantite: (targetId, newQty) => {
		const table = appsmith.store.editRecetteFinaleData || [];
		const allUnites = Unites.data;

		const updated = table.map(row => {
			const rowId = row.id_composant || row.id;
			if (rowId !== targetId) return row;

			const currentUnite = allUnites.find(u => u.id_unite === row.id_unite);
			const facteur = currentUnite?.facteur_conversion || 1;

			let newCoutTotal = null;

			if (row.type === "matiere" && row.quantite_unitaire > 0) {
				const coutUnitaireBase = row.prix_achat_ht / row.quantite_unitaire;
				newCoutTotal = coutUnitaireBase * newQty * facteur;
			} else {
				newCoutTotal = row.cout_unitaire * newQty;
			}

			return {
				...row,
				quantite: newQty,
				cout_total: newCoutTotal
			};
		});

		storeValue("editRecetteFinaleData", updated);
	},

  updateUnite: (targetId, newUniteId) => {
		const table = appsmith.store.editRecetteFinaleData || [];
		const allUnites = Unites.data;

		const updated = table.map(row => {
			const rowId = row.id_composant || row.id;
			if (rowId !== targetId) return row;

			const selectedUnite = row.unite_options.find(u => u.id_unite === newUniteId);
			const newUnite = allUnites.find(u => u.id_unite === newUniteId);

			if (!selectedUnite || !newUnite) return row;

			const facteur = newUnite?.facteur_conversion || 1;

			let newCoutTotal = null;

			if (row.type === "matiere" && row.quantite_unitaire > 0) {
				const coutUnitaireBase = row.prix_achat_ht / row.quantite_unitaire;
				newCoutTotal = coutUnitaireBase * row.quantite * facteur;
			} else {
				newCoutTotal = row.cout_unitaire * row.quantite;
			}

			return {
				...row,
				id_unite: selectedUnite.id_unite,
				unite: selectedUnite.nom_unite,
				cout_total: newCoutTotal
			};
		});

		storeValue("editRecetteFinaleData", updated);
	},

  deleteRow: async (id_composant) => {
    const updated = (appsmith.store.editRecetteFinaleData || []).filter(
      row => row.id_composant !== id_composant
    );
    storeValue("editRecetteFinaleData", updated);

    try {
      await Delete_all.run({ id_composant });
      showAlert("Composant supprimé", "success");
    } catch (err) {
      showAlert("Erreur de suppression: " + err.message, "error");
    }
  },

	addToEditRecette: () => {
		const selectedValues = MultiTreeSelect.selectedOptionValues || [];
		const allOptions = MultiTreeSelect.options || [];

		const flatItems = allOptions.flatMap(group => group.children || []);

		const matiereMap = Get_matiere_unites.data.reduce((acc, row) => {
			acc[row.id_matiere_premiere] = {
				id_unite: row.id_unite,
				nom_unite: row.nom_unite,
				prix_achat_ht: row.prix_achat_ht,
				quantite_unite: row.quantite_unite
			};
			return acc;
		}, {});

		const sousrecetteMap = Get_sous_recette_unites.data.reduce((acc, row) => {
			acc[row.id_sous_recette] = {
				id_unite: row.id_unite,
				nom_unite: row.nom_unite,
				cout_total: row.cout_total,
				quantite_produite: row.quantite_produite
			};
			return acc;
		}, {});

		const uniteMap = Unites.data.reduce((acc, row) => {
			if (!acc[row.type_unite]) acc[row.type_unite] = [];
			acc[row.type_unite].push({
				id_unite: row.id_unite,
				nom_unite: row.nom_unite,
				type_unite: row.type_unite
			});
			return acc;
		}, {});

		const newItems = selectedValues.map(val => {
			const matched = flatItems.find(item => item.value === val);
			if (!matched) return null;

			let id_unite = null;
			let nom_unite = "";
			let type_unite = "";
			let unite_options = [];
			let cout_unitaire = null;
			let cout_total = null;
			let quantite_unitaire = null;

			if (matched.type === "matiere" && matiereMap[matched.id]) {
				const info = matiereMap[matched.id];
				id_unite = info.id_unite;
				nom_unite = info.nom_unite;
				quantite_unitaire = info.quantite_unite;
				cout_unitaire = info.quantite_unite > 0 ? info.prix_achat_ht / info.quantite_unite : null;
				type_unite = Unites.data.find(u => u.id_unite === id_unite)?.type_unite || "";
				unite_options = uniteMap[type_unite] || [];
			}

			if (matched.type === "sous_recette" && sousrecetteMap[matched.id]) {
				const info = sousrecetteMap[matched.id];
				id_unite = info.id_unite;
				nom_unite = info.nom_unite;
				type_unite = Unites.data.find(u => u.id_unite === id_unite)?.type_unite || "";
				unite_options = uniteMap[type_unite] || [];

				const cout_par_unite = info.quantite_produite > 0
					? info.cout_total / info.quantite_produite
					: null;
				cout_unitaire = cout_par_unite;
			}

			return {
				id_composant: null, // chưa có vì chưa insert vào DB
				nom: matched.label,
				id: matched.id,
				type: matched.type,
				quantite: "",
				id_unite: id_unite,
				unite: nom_unite,
				type_unite: type_unite,
				unite_options: unite_options,
				quantite_unitaire: quantite_unitaire,
				prix_achat_ht: matched.type === "matiere" ? matiereMap[matched.id]?.prix_achat_ht : null,
				cout_unitaire: cout_unitaire,
				cout_total: null
			};
		}).filter(Boolean);

		const existing = appsmith.store.editRecetteFinaleData || [];
		const combined = [...existing];

		newItems.forEach(item => {
			const exists = combined.some(e => e.id === item.id && e.type === item.type);
			if (!exists) combined.push(item);
		});

		storeValue("editRecetteFinaleData", combined);
	},
	
	deleteRowtmp: (targetId) => {
		const table = appsmith.store.editRecetteFinaleData || [];

		const updated = table.filter(row => {
			const rowId = row.id_composant || row.id;
			return rowId !== targetId;
		});

		storeValue("editRecetteFinaleData", updated);
	},
	
	saveToDatabase: async () => {
		const recetteId = appsmith.URL.queryParams.recetteId;
		const table = appsmith.store.editRecetteFinaleData || [];
		const original = Table_ingredients.data || [];

		try {
			//update
			for (let row of table) {
				if (row.id_composant) {
					await Update_composant_recette.run({
						id_composant: row.id_composant,
						quantite: row.quantite,
						id_unite: row.id_unite
					});
				}
			}

			//insert
			for (let row of table) {
				if (!row.id_composant) {
					const isMatiere = row.type === "matiere";
					await Insert_composant_recette.run({
						recetteId,
						composantId: row.id,
						isMatiere,
						quantite: row.quantite,
						id_unite: row.id_unite
					});
				}
			}

			//delete
			const currentIds = table.map(row => row.id_composant).filter(Boolean);
			const originalIds = original.map(row => row.id_composant);

			const toDelete = originalIds.filter(id => !currentIds.includes(id));

			for (let id of toDelete) {
				await Delete_all.run({ id_composant: id });
			}

			showAlert("Recette mise à jour avec succès !", "success");

			//reload
			await JSObject1.init();

		} catch (err) {
			showAlert("Erreur de sauvegarde : " + err.message, "error");
		}
	}
};
