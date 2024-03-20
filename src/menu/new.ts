import * as Callback from '../telegram/callback';
import qrcode from '../xui/qrcode';
import config from '../config';
import xui from '../xui/xui';
import db from '../db';

export default class extends Callback.default {
	#tag: string = '';

	get key() {
		return 'new';
	}

	readonly return: Callback.QueryReturn = () => [];

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

		this.#tag = data.value;
		const server = config.find(this.#tag);

		if (!server) {
			throw Error('server not found');
		}

		const account = await xui.add(server);
		const chat_id = query.message?.chat.id!;

		db.read();
		db.update(query.from);
		db.write();

		await telegram.deleteMessage(chat_id, query.message?.message_id!);
		await telegram.sendPhoto(chat_id, await qrcode.gen(account.link), {
			caption: `
نام: ${account.remark}
لینک:
${account.link}`,
		});
	};
}
