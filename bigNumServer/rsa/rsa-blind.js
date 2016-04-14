var bignum = require('bignum');

rsa_blind = {
	publicKey: function(bits, n, e) {
		this.bits = bits;
		this.n = n;
		this.e = e;
	},
	privateKey: function(p, q, d, publicKey) {
		this.p = p;
		this.q = q;
		this.d = d;
		this.publicKey = publicKey;
	},
	generateKeys: function(bitlength) {
		var p, q, n, phi, e, d, keys = {};
		// if p and q are bitlength/2 long, n is then bitlength long
		this.bitlength = bitlength || 2048;
		console.log("Generating RSA keys of Blind Signature", this.bitlength, "bits");
		p = bignum.prime(this.bitlength / 2);

		do {
			q = bignum.prime(this.bitlength / 2);
		} while (q.cmp(p) === 0);
		n = p.mul(q);

		phi = p.sub(1).mul(q.sub(1));

		e = bignum(65537);
		d = e.invertm(phi);

		keys.publicKey = new rsa_blind.publicKey(this.bitlength, n, e);
		keys.privateKey = new rsa_blind.privateKey(p, q, d, keys.publicKey);
		return keys;
	}
};


rsa_blind.publicKey.prototype = {
	encrypt: function(m) {
		return m.powm(this.e, this.n);
	},
	decrypt: function(c) {
		return c.powm(this.e, this.n);
	}
};

rsa_blind.privateKey.prototype = {
	encrypt: function(m) {
		return m.powm(this.d, this.publicKey.n);
	},
	decrypt: function(c) {
		return c.powm(this.d, this.publicKey.n);
	}
};

module.exports = rsa_blind;
