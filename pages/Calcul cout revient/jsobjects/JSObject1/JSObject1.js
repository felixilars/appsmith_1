export default {
  onCoeffChange: () => {
    const coeff = parseFloat(Input_coeff.text);
    const ctp = appsmith.store.ctp_ht;
    const cr_ht = coeff * ctp;
    const tva = parseFloat(appsmith.store.tva);
    const cr_ttc = cr_ht * (1 + tva / 100);
		
		storeValue("cr_ht", cr_ht.toFixed(5));
		storeValue("coeff", coeff.toFixed(2));
		storeValue("cr_ttc", cr_ttc.toFixed(5));
  },
	
	  onTvaChange: () => {
    const tva = parseFloat(Input_tva.text);
    const cr_ht = parseFloat(appsmith.store.cr_ht);
    const cr_ttc = cr_ht * (1 + tva / 100);
		
		storeValue("tva", tva.toFixed(2));
		storeValue("cr_ttc", cr_ttc.toFixed(5));
  },
	
	  onCrHtChange: () => {
    const cr_ht = parseFloat(Input_cout_revient_HT.text);
    const ctp = appsmith.store.ctp_ht;
    const coeff = cr_ht / ctp;
    const tva = parseFloat(appsmith.store.tva);
    const cr_ttc = cr_ht * (1 + tva / 100);
		
		storeValue("cr_ht", cr_ht.toFixed(5));
		storeValue("coeff", coeff.toFixed(2));
		storeValue("cr_ttc", cr_ttc.toFixed(5));
  },
	
	  onCrTtcChange: () => {
    const cr_ttc = parseFloat(Input_cout_revient_TTC.text);
    const cr_ht = parseFloat(appsmith.store.cr_ht);
    const tva = ((cr_ttc / cr_ht) - 1) * 100;
		
		storeValue("tva", tva.toFixed(2));
		storeValue("cr_ttc", cr_ttc.toFixed(5));
  },
	
	resetValeurs: () => {
		const ctp = vue_cout_recette_finale.data[0].cout_total_production;
		const coeff = vue_cout_recette_finale.data[0].coefficient_multiplicateur;
		const tva = 5.5;
		const cr_ht = ctp * coeff;
		const cr_ttc = cr_ht * (1 + tva / 100);
		
		storeValue("cr_ht", cr_ht.toFixed(5));
		storeValue("coeff", coeff);
		storeValue("cr_ttc", cr_ttc.toFixed(5));
		storeValue("ctp_ht", ctp);
		storeValue("tva", tva);
	}
}