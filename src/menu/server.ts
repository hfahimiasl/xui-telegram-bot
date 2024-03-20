import * as Callback from '../telegram/callback';
import config from '../config';
import xui from '../xui/xui';

export default class extends Callback.default {
	get key() {
		return 'server';
	}

	readonly return: Callback.QueryReturn = () =>
		Callback.default.return('home');

	readonly markup: Callback.QueryMarkup = async () => {
		return {
			inline_keyboard: [
				...(await Promise.all(
					config.object.map(async value => {
						const list = (await xui.list(value)).filter(
							value => !xui.expired(value),
						);

						return [
							{
								text:
									xui.capacity(value) - list.length > 0
										? `سرور ${value.tag}`
										: `سرور ${value.tag} (تکمیل ظرفیت) 🚫`,
								callback_data: Callback.default.encode(
									'panel',
									value.tag,
								),
							},
						];
					}),
				)),
				this.return(),
			],
		};
	};

	readonly listener: Callback.QueryListener = async (telegram, query) => {
		telegram.editMessageText('لیست سرور ها', {
			reply_markup: await this.markup(query.from),
			...Callback.default.option(query),
		});
	};
}
