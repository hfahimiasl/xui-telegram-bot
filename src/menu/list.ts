import Telegram from 'node-telegram-bot-api';
import * as Callback from '../telegram/callback';
import * as XUI from '../xui/xui';
import config from '../config';

export interface QueryData {
	id: number;
	tag: string;
}

export default class extends Callback.default {
	#tag: string = '';

	get key() {
		return 'list';
	}

	readonly return: Callback.QueryReturn = () =>
		Callback.default.return('panel', this.#tag);

	readonly markup: Callback.QueryMarkup = async (
		_,
		inbound: XUI.Inbound[],
	) => {
		const button: Telegram.InlineKeyboardButton[] = [];
		const inline_keyboard: Telegram.InlineKeyboardButton[][] = [];

		let i = 0;

		for (const j of inbound.sort((a, b) => a.port - b.port)) {
			button.push({
				text: `${j.remark}${j.enable ? '' : ' 🚫'}`,
				callback_data: Callback.default.encode(
					'inbound',
					JSON.stringify({
						id: j.id,
						tag: this.#tag,
					} as QueryData),
				),
			});

			if (++i % 4 === 0) {
				inline_keyboard.push([...button]);
				button.length = 0;
			}
		}

		if (button.length) {
			inline_keyboard.push([...button]);
		}

		inline_keyboard.push(this.return());

		return {
			inline_keyboard,
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

		this.#tag = data.value;
		const server = config.find(this.#tag);

		if (!server) {
			throw Error('server not found');
		}

		telegram.editMessageText(`اکانت های سرور ${this.#tag}`, {
			reply_markup: await this.markup(
				query.from,
				await XUI.default.list(server),
			),
			...Callback.default.option(query),
		});
	};
}
