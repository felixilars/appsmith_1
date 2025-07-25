export default {
  check: async () => {
    if (
      !Input_nom.text || 
      !Select_categorie.selectedOptionLabel || 
      !Select_fournisseur.selectedOptionLabel || 
      !Input_prix.text || 
      !Select_unite.selectedOptionLabel || 
      !Input_quantite_unite.text
    ) {
      showAlert("Veuillez remplir tous les champs obligatoires de la sous-recette.", "warning");
      return false;
    }
    return true;
  }
}
