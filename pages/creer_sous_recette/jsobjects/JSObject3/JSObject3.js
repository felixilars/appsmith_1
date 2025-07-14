export default {
	async save() {
		if (Table1.updatedRows && Table1.updatedRows.length > 0) {
			const updated = Table1.updatedRows.map(row => ({
				...row.allFields,
				quantite: row.updatedFields.quantite
			}));
			storeValue("table_temp", updated);
		}
	}
}