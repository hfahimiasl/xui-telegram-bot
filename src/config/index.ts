import fs from 'fs';

export interface UFW {
	start: number;
	end: number;
}

export interface Server {
	tag: string;
	host: string;
	port: number;
	ufw: UFW;
	username: string;
	password: string;
	traffic: number;
	expire: number;
}

export default abstract class {
	static #object: Server[];

	static get object() {
		return this.#object;
	}

	static readonly load = (path: string) => {
		this.#object = JSON.parse(
			fs.readFileSync(path, 'utf-8'),
			(key, value) => {
				if (key === 'ufw') {
					const ufw = (value as string).split(':').map(i => +i);

					return {
						start: ufw[0],
						end: ufw[1],
					};
				}

				return value;
			},
		);
	};

	static readonly find = (tag: string) => {
		return this.#object.find(i => i.tag === tag);
	};
}
