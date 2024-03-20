import * as Callback from '../telegram/callback';
import { QueryData } from './list';
import config from '../config';
import { Time } from '../xui';
import xui from '../xui/xui';
import db from '../db';

export default class extends Callback.default {
	#data: QueryData = {} as QueryData;

	get key() {
		return 'extend';
	}

	readonly return: Callback.QueryReturn = () =>
		Callback.default.return('inbound', JSON.stringify(this.#data));

	readonly markup: Callback.QueryMarkup = async () => {
		return {
			inline_keyboard: [this.return()],
		};
	};

	readonly listener: Callback.QueryListener = async (
		telegram,
		query,
		data,
	) => {
		if (!data.value) {
			throw Error('invalid value');
		}

		this.#data = JSON.parse(data.value);
		const server = config.find(this.#data.tag);

		if (!server) {
			throw Error('server not found');
		}

		await xui.update(server, this.#data.id, {
			up: 0,
			down: 0,
			total: server.traffic,
			enable: true,
			expiryTime: Time.expiry(server.expire),
		});

		db.read();
		db.update(query.from);
		db.write();

		telegram.editMessageText(`اکانت ${this.#data.id} تمدید شد`, {
			reply_markup: await this.markup(query.from),
			...Callback.default.option(query),
		});
	};
}
