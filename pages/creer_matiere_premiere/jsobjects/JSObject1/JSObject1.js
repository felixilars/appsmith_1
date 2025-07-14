export default {
  check: async () => {
    if (
      !Input_nom.text || 
      Select_categorie.selectedOptionLabel == null || 
      Select_fournisseur.selectedOptionLabel == null || 
      !Input_prix.text || 
      Select_unite.selectedOptionLabel == null || 
      !Input_quantite_unite.text
    ) {
      showAlert("Veuillez remplir tous les champs obligatoires de la sous-recette.", "warning");
      return false;
    }
    return true;
  }
}
