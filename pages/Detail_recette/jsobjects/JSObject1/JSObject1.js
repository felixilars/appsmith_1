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
  }
};
