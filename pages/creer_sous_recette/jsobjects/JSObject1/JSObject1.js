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
					id_unite: null
				});
			}

			showAlert("Sous-recette sauvegardée", "success");
			storeValue('table_temp', []);
			return true;
			
		} catch (error) {
			showAlert("Erreur lors de l'enregistrement de la sous-recette", "error");
      return false;
		}
	}
}
