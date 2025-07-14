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
		
    storeValue('table_temp', [
      ...table,
      {
        id_matiere_premiere: selected,
        nom_matiere_premiere: nom,
        quantite: null,
				id_unite: id_unite,
    	  unite: nom_unite
      }
    ]);
  }
}
