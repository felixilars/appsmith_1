export default {
	Init: async () => {
		await details_recettes_finales.run();
		await Sum_quantite.run();
		await vue_cout_detaille_recette_fina.run();
		resetWidget("Table1", true);
		await vue_cout_recette_finale.run();

		const ctp = vue_cout_recette_finale.data[0].cout_total_production;
		const coeff = vue_cout_recette_finale.data[0].coefficient_multiplicateur;
		const tva = 5.5;
		const cr_ht = ctp * coeff;
		const cr_ttc = cr_ht * (1 + tva / 100);

		storeValue("ctp_ht", ctp);
		storeValue("coeff", coeff);
		storeValue("tva", tva);
		storeValue("cr_ht", cr_ht.toFixed(5));
		storeValue("cr_ttc", cr_ttc.toFixed(5));
	}
}