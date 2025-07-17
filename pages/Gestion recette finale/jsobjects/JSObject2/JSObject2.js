export default {
  // Tạo map type_unite 
  enrichData: (raw) => {
    const uniteMap = Unites.data.reduce((acc, row) => {
      if (!acc[row.type_unite]) acc[row.type_unite] = [];
      acc[row.type_unite].push({
        id_unite: row.id_unite,
        nom_unite: row.nom_unite
      });
      return acc;
    }, {});

    return raw.map(row => ({
			id_composant: row.id_composant,
			nom: row.nom_composant,
			type: row.type_composant,
			quantite: row.quantite_unite,
			id_unite: row.id_unite,
			unite: row.nom_unite,
			type_unite: row.type_unite,
			prix_achat_ht: row.prix_achat_ht,
			quantite_unitaire: row.quantite_unitaire,
			cout_unitaire: row.cout_unitaire,
			cout_total: row.cout_total,
			unite_options: uniteMap[row.type_unite] || []
		}));
  },

  // Load và enrich dữ liệu composant theo recette_finale
  loadRecetteData: async (id_recette_finale) => {
    await Table_ingredients.run({ recetteId: id_recette_finale });

    const data = this.enrichData(Table_ingredients.data);
    storeValue("editRecetteFinaleData", data);
  },

  // Cập nhật số lượng (quantite)
  updateQuantite: (id_composant, newQty) => {
    const table = appsmith.store.editRecetteFinaleData || [];
    const updated = table.map(row =>
      row.id_composant === id_composant
        ? { ...row, quantite: newQty }
        : row
    );
    storeValue("editRecetteFinaleData", updated);
  },

  // Cập nhật đơn vị (id_unite)
  updateUnite: (id_composant, id_unite) => {
    const table = appsmith.store.editRecetteFinaleData || [];
    const updated = table.map(row => {
      if (row.id_composant === id_composant) {
        const selected = row.unite_options.find(u => u.id_unite === id_unite);
        if (!selected) return row;

        return {
          ...row,
          id_unite: selected.id_unite,
          unite: selected.nom_unite
        };
      }
      return row;
    });

    storeValue("editRecetteFinaleData", updated);
  },

  // Xóa 1 dòng khỏi bảng tạm và database
  deleteRow: async (id_composant) => {
    const updated = (appsmith.store.editRecetteFinaleData || []).filter(
      row => row.id_composant !== id_composant
    );
    storeValue("editRecetteFinaleData", updated);

    try {
      await Delete_composants_recette.run({ id_composant });
      showAlert("Composant supprimé", "success");
    } catch (err) {
      showAlert("Erreur de suppression: " + err.message, "error");
    }
  },

  // Lưu tất cả thay đổi vào database
  saveToDatabase: async () => {
    const table = appsmith.store.editRecetteFinaleData || [];

    try {
      for (let row of table) {
        await Update_composant_recette.run({
          id_composant: row.id_composant,
          quantite_unite: row.quantite,
          id_unite: row.id_unite
        });
      }

      showAlert("Recette mise à jour avec succès !", "success");
    } catch (err) {
      showAlert("Erreur de sauvegarde: " + err.message, "error");
    }
  }
};
