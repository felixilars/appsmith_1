export default {
	totalCost: () => {
    const table = JSObject1.enrichTableWithFooter();
    const totalRow = table[table.length - 1];
    return totalRow?.cout_total || 0;
  },
  
  totalQty: () => {
    const table = JSObject1.enrichTableWithFooter();
    const totalRow = table[table.length - 1];
    return totalRow?.quantite || 0;
  }
}