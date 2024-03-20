import * as Callback from '../telegram/callback';
import { QueryData } from './list';
import qrcode from '../xui/qrcode';
import config from '../config';
import * as XUI from '../xui/xui';
import { VMess } from '../xui/';

export default class extends Callback.default {
	#data: QueryData = {} as QueryData;

	get key() {
		return 'qrlink';
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

		const inbound = await XUI.default.find(server, this.#data.id);

		if (!inbound) {
			throw Error('inbound not found');
		}

		const chat_id = query.message?.chat.id!;
		const link = VMess.gen({
			v: '2',
			ps: inbound.remark,
			add: server.host,
			port: inbound.port,
			id: JSON.parse(inbound.settings)['clients'][0]['id'] as string,
			aid: 0,
			net: 'ws',
			type: 'none',
			host: '',
			path: '/',
			tls: 'none',
		});

		await telegram.deleteMessage(chat_id, query.message?.message_id!);
		await telegram.sendPhoto(chat_id, await qrcode.gen(link), {
			caption: `
نام: ${inbound.remark}
لینک:
${link}`,
		});
	};
}
