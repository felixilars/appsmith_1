export default {
	expandedSous: {},
	
	toggleSous(key) {
		this.expandedSous[key] = !this.expandedSous[key];
		return this.expandedSous;
	}
};