import { describe, expect, test } from 'vitest';
import { X25519KeyPair, JsonWebEncryptionSuite } from '$lib';

const plaintext = require('../fixtures/plaintext.json');
const jwe = require('../fixtures/jwe.json');
const key = require('../fixtures/keypairs/X25519KeyAgreementKey2019.json');
describe('JWE', () => {
	test('Can encrypt data', async () => {
		const cipher = new JsonWebEncryptionSuite();
		const recipients = [
			{
				header: {
					kid: key.id,
					alg: 'ECDH-ES+A256KW'
				}
			}
		];
		const publicKeyResolver = () => key;

		const result = await cipher.encrypt({
			data: plaintext,
			recipients,
			publicKeyResolver
		});
		expect(result).to.have.property('protected');
		expect(result.recipients.length).to.equal(1);
		expect(result).to.have.property('iv');
		expect(result).to.have.property('ciphertext');
		expect(result).to.have.property('tag');
	});

	test('Can decrypt data', async () => {
		const cipher = new JsonWebEncryptionSuite();
		const keyAgreementKey = new X25519KeyPair(
			key.id,
			key.controller,
			key.publicKeyBase58,
			key.privateKeyBase58
		);

		const result = await cipher.decrypt({
			jwe,
			keyAgreementKey
		});

		expect(result.body).to.equal('hello world');
	});
});
