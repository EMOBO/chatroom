function Chatlist() {
	this.userlist = [];
	this.size = 0;
}
Chatlist.prototype = {
	isHave: function(usrObj) {
		return this.userlist.some(function(item, index, array) {
			return (item.username === usrObj.username);
		});
	},
	/* add user name into userlist
	 * return true if insert sucessfully
	 * else return false;
	 */
	add: function(usrObj) {
		if (this.isHave(usrObj)) {
			return false;
		}
		this.userlist.push(usrObj);
		this.size++;
		return true;
	},

	// return removed array of userlist
	remove: function(username) {
		this.userlist = this.userlist.filter(function(item, index, array) {
			return (item.username != username);
		});
		this.size--;
		return this.userlist;
	},

	// find a specific online user
	find : function(username) {
		return this.userlist.filter(function(item, index, array) {
			return (item.username === username);
		});
	}
};

module.exports = Chatlist;