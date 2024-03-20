import * as Callback from '../telegram/callback';
import { Bot } from '../telegram';
import db from '../db';

export default class extends Callback.default {
	get key() {
		return 'bill';
	}

	readonly return: Callback.QueryReturn = () =>
		Callback.default.return('home');

	readonly markup: Callback.QueryMarkup = async () => {
		return {
			inline_keyboard: [this.return()],
		};
	};

	readonly listener: Callback.QueryListener = async (telegram, query) => {
		db.read();

		telegram.editMessageText(
			Bot.admin(query.from)
				? JSON.stringify(db.user, ['id', 'first_name', 'inbound'], 4)
				: `${db.find(query.from.id)?.inbound ?? 0} اکانت تسویه نشده`,
			{
				reply_markup: await this.markup(query.from),
				...Callback.default.option(query),
			},
		);
	};
}
