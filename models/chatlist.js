function Chatlist() {
}
Chatlist.prototype = {
	userlist : [],
	size : 0,
	isHave : function(usrObj) {
			return this.userlist.some(function(item, index, array) {
			return (item.username === usrObj.usrname);
		});
	},
	/* add user name into userlist
	* return true if insert sucessfully
	* else return false;
	*/
	add : function(usrObj) {
		if (this.isHave(usrObj)) {
			return false;
		}
		this.userlist.push(usrObj);
		this.size++;
		return true;
	},

	// return removed array of userlist
	remove : function(usrname) {
		this.userlist = this.userlist.filter(function(item, index, array) {
			return (item.usrname != usrname);
		});
		return this.userlist;
	}
};

module.exports = Chatlist;