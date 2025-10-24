const UserState = {
	users: [],
	setUsers: function (newUsersArray) {
		this.users = newUsersArray;
	},
};

function activateUser(id, name, room) {
	const user = { id, name, room };
	UserState.setUsers([
		...UserState.users.filter((user) => user.id !== id),
		user,
	]);
	return user;
}

function getUser(id) {
	return UserState.users.find((user) => user.id === id);
}

function getUsersInRoom(room) {
	return UserState.users.filter((user) => user.room === room);
}

function getAllActiveRooms() {
	return Array.from(new Set(UserState.users.map((user) => user.room)));
}

function deactivateUser(id) {
	UserState.setUsers(UserState.users.filter((user) => user.id !== id));
}

export {
	activateUser,
	getUser,
	getUsersInRoom,
	getAllActiveRooms,
	deactivateUser,
};
