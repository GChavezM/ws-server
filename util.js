function buildMessage(sender, message) {
	return { sender, message, time: new Date() };
}

export { buildMessage };
