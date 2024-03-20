import Telegram from 'node-telegram-bot-api';
import * as Callback from '../telegram/callback';
import { Bot } from '../telegram';
import { Time, Traffic } from '../xui';
import { QueryData } from './list';
import * as XUI from '../xui/xui';
import config from '../config';

export default class extends Callback.default {
	#data: QueryData = {} as QueryData;

	get key() {
		return 'inbound';
	}

	readonly return: Callback.QueryReturn = () =>
		Callback.default.return('list', this.#data.tag);

	readonly markup: Callback.QueryMarkup = async (
		user,
		inbound: XUI.Inbound,
	) => {
		const admin = Bot.admin(user);
		const inline_keyboard: Telegram.InlineKeyboardButton[][] = [];

		if (XUI.default.expired(inbound)) {
			if (admin) {
				inline_keyboard.push([
					{
						text: 'تمدید',
						callback_data: Callback.default.encode(
							'extend',
							JSON.stringify(this.#data),
						),
					},
				]);
			}
		} else {
			if (admin) {
				inline_keyboard.push([
					{
						text: inbound.enable ? 'غیر فعال سازی' : 'فعال سازی',
						callback_data: Callback.default.encode(
							inbound.enable ? 'disable' : 'enable',
							JSON.stringify(this.#data),
						),
					},
				]);
			}

			if (inbound.enable) {
				inline_keyboard.push([
					{
						text: 'بارکد',
						callback_data: Callback.default.encode(
							'qrlink',
							JSON.stringify(this.#data),
						),
					},
				]);
			}
		}

		if (admin) {
			inline_keyboard.push([
				{
					text: 'حذف',
					callback_data: Callback.default.encode(
						'deleteack',
						JSON.stringify(this.#data),
					),
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
		if (!data.value) {
			throw Error('invalid value');
		}

		this.#data = JSON.parse(data.value);
		const server = config.find(this.#data.tag);

		if (!server) {
			throw Error('server not found');
		}

		const inbound = await XUI.default.find(server, this.#data.id);

		if (!inbound) {
			throw Error('inbound not found');
		}

		const time = Time.toString((inbound.expiryTime - Date.now()) / 1000);
		const traffic = Traffic.toString(
			inbound.total - (inbound.up + inbound.down),
		);

		telegram.editMessageText(
			`
نام: ${inbound.remark}
وضعیت: ${inbound.enable ? 'فعال' : 'غیر فعال 🚫'}
زمان: ${time}
ترافیک: ${traffic}
`,
			{
				reply_markup: await this.markup(query.from, inbound),
				...Callback.default.option(query),
			},
		);
	};
}
