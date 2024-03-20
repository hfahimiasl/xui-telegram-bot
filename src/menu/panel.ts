import Telegram from 'node-telegram-bot-api';
import * as Callback from '../telegram/callback';
import config from '../config';
import xui from '../xui/xui';

export default class Panel extends Callback.default {
	get key() {
		return 'panel';
	}

	readonly return: Callback.QueryReturn = () =>
		Callback.default.return('server');

	readonly markup: Callback.QueryMarkup = async (_, tag: string) => {
		const inline_keyboard: Telegram.InlineKeyboardButton[][] = [];

		inline_keyboard.push([
			{
				text: 'لیست اکانت ها',
				callback_data: Callback.default.encode('list', tag),
			},
		]);

		const server = config.find(tag);

		if (!server) {
			throw Error('server not found');
		}

		if (await xui.free(server)) {
			inline_keyboard.push([
				{
					text: 'اکانت جدید',
					callback_data: Callback.default.encode('new', tag),
				},
			]);
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
		telegram.editMessageText(`سرور ${data.value}`, {
			reply_markup: await this.markup(query.from, data.value),
			...Callback.default.option(query),
		});
	};
}
