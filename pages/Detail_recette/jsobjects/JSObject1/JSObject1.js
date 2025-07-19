export default {
  enrichTableWithFooter: () => {
    const raw = table_ingredient.data || [];

    const totalCost = raw.reduce((sum, row) => sum + (row.cout_total || 0), 0);
    const totalQty = raw.reduce((sum, row) => sum + (row.quantite_unite || 0), 0);

    const enriched = raw.map(row => ({
      type_composant: row.type_composant,
      nom: row.nom_composant,
      quantite: row.quantite_unite,
      unite: row.nom_unite,
      cout_total: row.cout_total,
      cout_pourcent: totalCost > 0 ? (row.cout_total / totalCost) * 100 : 0
    }));

    const footerRow = {
      type_composant: "TOTAL",
      nom: "",
      quantite: totalQty,
      unite: "", 
      cout_total: totalCost,
      cout_pourcent: 100
    };

    return [...enriched, footerRow];
  },
	compute: () => {
    const tva = parseFloat(Input_tva.text);
    const coeff = parseFloat(Input_coeff.text);

    const cost = utils.totalCost();
    const prix_vente = cost * coeff * (1 + tva / 100);

    const marge_prix = prix_vente > 0 ? ((prix_vente - cost) / prix_vente) * 100 : 0;
    const marge_cout = cost > 0 ? ((prix_vente - cost) / cost) * 100 : 0;
    const food_cost = prix_vente > 0 ? (cost / prix_vente) * 100 : 0;

    return {
      prix_vente,
      marge_prix,
      marge_cout,
      food_cost
    };
  }
};
