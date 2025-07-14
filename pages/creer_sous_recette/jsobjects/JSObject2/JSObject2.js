export default {
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
  }
}