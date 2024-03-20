import Telegram from 'node-telegram-bot-api';
import * as Callback from '../telegram/callback';

export default class extends Callback.default {
	get key() {
		return 'home';
	}

	readonly text = (user: Telegram.User) => `${user.first_name} سلام`;

	readonly return: Callback.QueryReturn = () => [];

	readonly markup: Callback.QueryMarkup = async () => {
		return {
			inline_keyboard: [
				[
					{
						text: 'صورتحساب',
						callback_data: Callback.default.encode('bill'),
					},
				],
				[
					{
						text: 'سرور ها',
						callback_data: Callback.default.encode('server'),
					},
				],
			],
		};
	};

	readonly listener: Callback.QueryListener = async (telegram, query) => {
		telegram.editMessageText(this.text(query.from), {
			reply_markup: await this.markup(query.from),
			...Callback.default.option(query),
		});
	};
}
