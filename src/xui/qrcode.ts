import fs from 'fs';
import * as QRCode from 'qrcode';

export default abstract class {
	static #path: string;

	static readonly set = (path: string) => {
		this.#path = path;
	};

	static readonly gen = async (data: string) => {
		const url = await QRCode.toDataURL(data);

		fs.writeFileSync(
			this.#path,
			url.replace(/^data:image\/png;base64,/, ''),
			'base64',
		);

		return this.#path;
	};
}
