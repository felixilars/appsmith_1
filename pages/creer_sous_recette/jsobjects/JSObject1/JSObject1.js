export default {
  async save() {
		if (Table1.updatedRows && Table1.updatedRows.length > 0) {
			const updated = Table1.updatedRows.map(row => ({
				...row.allFields,
				quantite: row.updatedFields.quantite
			}));
			storeValue("table_temp", updated);
		}

		const composants = appsmith.store.table_temp;

		if (!composants || composants.length === 0) {
			showAlert("Veuillez sélectionner au moins 1 matière première", "warning");
			return false;
		}

		if (composants.some(c => !c.quantite || isNaN(Number(c.quantite)))) {
			showAlert("Certains matieres n'ont pas saisi de quantités valides.", "error");
			return false;
		}
		
		if (!Input_nom.text || !Input_quantite.text || !appsmith.store.table_temp) {
      showAlert("Veuillez remplir tous les champs obligatoires de la sous-recette.", "warning");
      return false;
    }
		
		try {
			const result = await InsertSousRecette.run();
			const idSousRecette = result[0].id_sous_recette;

			for (let comp of composants) {
				await InsertComposant.run({
					id_sous_recette: idSousRecette,
					id_matiere_premiere: comp.id_matiere_premiere,
					quantite_unite: comp.quantite,
					id_unite: comp.id_unite
				});
			}

			showAlert("Sous-recette sauvegardée", "success");
			storeValue('table_temp', []);
			return true;
			
		} catch (error) {
			showAlert("Erreur lors de l'enregistrement de la sous-recette", "error");
      return false;
		}
	},
	addMatiere() {
    const selected = Select_matiere_premiere.selectedOptionValue;
    if (!selected) return;
		
    const table = appsmith.store.table_temp || [];
    const exists = table.some(item => item.id_matiere_premiere === selected);
    if (exists) {
      showAlert("Cet ingrédient a été ajouté", "info");
      return;
    }
    const nom = Select_matiere_premiere.selectedOptionLabel;

		const matched = Get_matiere_unites.data.find(
			row => row.id_matiere_premiere === selected
		);

		const id_unite = matched?.id_unite || null;
		const nom_unite = matched?.nom_unite || "";
		const type_unite = matched?.type_unite || "";
		
		const unite_compatibles = Unite.data.filter(
      u => u.type_unite === type_unite
    );
		
    storeValue('table_temp', [
      ...table,
      {
        id_matiere_premiere: selected,
        nom_matiere_premiere: nom,
        quantite: null,
				id_unite: id_unite,
    	  nom_unite: nom_unite,
    		type_unite: type_unite,
				unite_options: unite_compatibles
      }
    ]);
  },
	updateUniteSelection(id_matiere_premiere, new_id_unite) {
    const updated = (appsmith.store.table_temp || []).map(row => {
      if (row.id_matiere_premiere === id_matiere_premiere) {
        const selectedUnite = row.unite_options.find(u => u.id_unite === new_id_unite);
        return {
          ...row,
          id_unite: selectedUnite.id_unite,
          unite: selectedUnite.nom_unite
        };
      }
      return row;
    });

    storeValue("table_temp", updated);
  },
	updateQuantite(id_matiere_premiere, new_quantite) {
		const updated = (appsmith.store.table_temp || []).map(row => {
			if (row.id_matiere_premiere === id_matiere_premiere) {
				return {
					...row,
					quantite: new_quantite
				};
			}
			return row;
		});

		storeValue("table_temp", updated);
	}
}