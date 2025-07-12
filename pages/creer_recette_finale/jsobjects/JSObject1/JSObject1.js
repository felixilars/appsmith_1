export default {

  tempTableData: [],

  addToTable: () => {
    const selectedValues = MultiTreeSelect.selectedOptionValues;
  	const allOptions = MultiTreeSelect.options;

    const flatItems = allOptions.flatMap(group => group.children || []);
		
		const newItems = selectedValues.map(val => {
			const matched = flatItems.find(item => item.value === val);
			return {
				nom: matched?.label || val,
				id: matched?.id || null,
				type: matched?.type || null,
				quantite: "",
				unite: ""
			};
		});

		// Avoid duplicates
		const existing = appsmith.store.tempTableData || [];
		const combined = [...existing];

		newItems.forEach(item => {
			const duplicate = combined.some(e => e.id === item.id && e.type === item.type);
			if (!duplicate && item.id && item.type) {
				combined.push(item);
			}
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
		
		const updatedData = TableRecette.tableData.map(row => ({
			...row,
			quantite: Number(row.quantite)  // ép kiểu luôn
		}));

		storeValue("tempTableData", updatedData);
		
    try {
      const recetteData = await Insert_recette_finale.run();
      const recetteId = recetteData[0].id_recette_finale;

      for (let item of appsmith.store.tempTableData) {
				await Insert_composants.run ({
					id_recette_finale: recetteId,
					id_matiere_premiere: item.type === "matiere" ? item.id : null,
					id_sous_recette: item.type === "sous-recette" ? item.id : null,
					quantite_unite: item.quantite,
					id_unite: null
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

