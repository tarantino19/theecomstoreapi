const { expressjwt: jwt } = require('express-jwt');

function authJwt() {
	const secret = process.env.secret;

	return jwt({
		secret,
		algorithms: ['HS256'],
		isRevoked: isRevoked,
	}).unless({
		path: [
			{ url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
			{ url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
			,
			'/api/v1/users/login',
			'/api/v1/users/register',
		],
	});
}

async function isRevoked(req, jwt) {
	const payload = jwt.payload;
	// Check if the user is not an admin
	if (!payload.isAdmin) {
		// If not an admin, consider the token revoked
		return true;
	}
	// If the user is an admin, consider the token valid
	return false;
}

// async function isRevoked(req, payload, done) {
// 	if(!payload.isAdmin) {
// 			done(null, true)
// 	}

// 	done();
// }

module.exports = authJwt;
