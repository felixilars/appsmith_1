export default {
  getOptions: (currentRow) => {
    const currentUnite = Unites.data.find(u => u.nom_unite === currentRow.unite);
    const type = currentUnite?.type_unite;

    return Unites.data
      .filter(u => u.type_unite === type)
      .map(u => ({
        label: u.nom_unite,
        value: u.nom_unite
      }));
  },
	async saveRecette() {
		try {
			const recetteId = Table1.triggeredRow.id_recette_finale;
			const updatedNom = Input_nom1.text;
			const updatedDescription = Input_description1.text;

			await Update_recette.run({
				id_recette_finale: recetteId,
				nom: updatedNom,
				description: updatedDescription
			});

			const allRows = Table_Ingredients.processedTableData || [];

			const validRows = allRows.filter(row =>
				row.id_composant &&
				row.quantite !== undefined &&
				!isNaN(row.quantite)
			);

			for (let row of validRows) {
				await Update_composant_recette.run({
					id_composant: row.id_composant,
					quantite: row.quantite,
					unite: row.unite
				});
			}

			await Table_ingredients.run();

			showAlert("Recette et composants mis à jour avec succès !", "success");
		} catch (e) {
			showAlert("Erreur lors de la mise à jour: " + e.message, "error");
		}
	}
}
