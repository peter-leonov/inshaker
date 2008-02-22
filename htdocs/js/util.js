String.prototype.htmlName = function () {
	return this.toLowerCase().replace(/ /g, "_");
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.substr(1);
}

function toArray(hash) {
	var results = [];
	for(key in hash) results.push(hash[key]);
	return results;
}