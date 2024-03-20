import fs from 'fs';
import Telegram from 'node-telegram-bot-api';

export interface User extends Telegram.User {
	inbound: number;
}

export default abstract class {
	static #path: string;
	static #user: User[] = [];

	static get user() {
		return this.#user;
	}

	static readonly set = (path: string) => {
		this.#path = path;
	};

	static readonly read = () => {
		this.#user = JSON.parse(fs.readFileSync(this.#path, 'utf-8'));
	};

	static readonly write = () => {
		fs.writeFileSync(this.#path, JSON.stringify(this.#user, undefined, 4));
	};

	static readonly find = (id: number) => {
		return this.#user.find(i => i.id === id);
	};

	static readonly update = (user: Telegram.User) => {
		const i = this.find(user.id);

		if (i) {
			i.is_bot = user.is_bot;
			i.first_name = user.first_name;
			i.last_name = user.first_name;
			i.username = user.username;
			i.language_code = user.language_code;
			i.inbound++;
		} else {
			this.#user.push({
				...user,
				inbound: 1,
			});
		}
	};
}
