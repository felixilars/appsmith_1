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

    storeValue('table_temp', [
      ...table,
      {
        id_matiere_premiere: selected,
        nom_matiere_premiere: nom,
        quantite: null
      }
    ]);
  }
}
