export default {

	tempTableData: [],

	addToTable: () => {
		const selectedValues = MultiTreeSelect.selectedOptionValues || [];
		const allOptions = MultiTreeSelect.options || [];

		const flatItems = allOptions.flatMap(group => group.children || []);

		const matiereMap = Get_matiere_unites.data.reduce((acc, row) => {
			acc[row.id_matiere_premiere] = {
				id_unite: row.id_unite,
				nom_unite: row.nom_unite
			};
			return acc;
		}, {});

		const sousrecetteMap = Get_sous_recette_unites.data.reduce((acc, row) => {
			acc[row.id_sous_recette] = {
				id_unite: row.id_unite,
				nom_unite: row.nom_unite
			};
			return acc;
		}, {});

		const newItems = selectedValues.map(val => {
			const matched = flatItems.find(item => item.value === val);
			if (!matched) return null;

			let id_unite = null;
			let nom_unite = "";

			if (matched.type === "matiere" && matiereMap[matched.id]) {
				id_unite = matiereMap[matched.id].id_unite;
				nom_unite = matiereMap[matched.id].nom_unite;
			}

			if (matched.type === "sous_recette" && sousrecetteMap[matched.id]) {
				id_unite = sousrecetteMap[matched.id].id_unite;
				nom_unite = sousrecetteMap[matched.id].nom_unite;
			}

			return {
				nom: matched.label,
				id: matched.id,
				type: matched.type,
				quantite: "",
				unite: nom_unite,
				id_unite: id_unite
			};
		}).filter(Boolean);

		const existing = appsmith.store.tempTableData || [];
		const combined = [...existing];

		newItems.forEach(item => {
			const exists = combined.some(e => e.id === item.id && e.type === item.type);
			if (!exists) combined.push(item);
		});

		storeValue("tempTableData", combined);
	},

	checkAndSave: async () => {
		// Kiểm tra thông tin bắt buộc
		if (!Input_nom.text || !Input_prix.text || !appsmith.store.tempTableData.length) {
			showAlert("Veuillez remplir tous les champs obligatoires", "error");
			return;
		}

		const hasMissingQty = this.tempTableData.some(item => !item.quantite || Number(item.quantite) <= 0);
		if (hasMissingQty) {
			showAlert("Certaines quantités sont manquantes ou invalides.", "error");
			return;
		}

		if (TableRecette.updatedRows && TableRecette.updatedRows.length > 0) {
			const updated = TableRecette.updatedRows.map(row => ({
				...row.allFields,
				quantite: row.updatedFields.quantite
			}));
			storeValue("tempTableData", updated);
		}

		try {
			const recetteData = await Insert_recette_finale.run();
			const recetteId = recetteData[0].id_recette_finale;

			for (let item of appsmith.store.tempTableData) {
				await Insert_composants.run ({
					id_recette_finale: recetteId,
					id_matiere_premiere: item.type === "matiere" ? item.id : null,
					id_sous_recette: item.type === "sous_recette" ? item.id : null,
					quantite_unite: item.quantite,
					id_unite: item.id_unite
				});
			}

			showAlert("Recette ajoutée avec succès !", "success");
			storeValue('tempTableData', []);
		}
		catch (err) {
			showAlert("Erreur lors de l'enregistrement: " + err.message, "error");
		}
	}
};

