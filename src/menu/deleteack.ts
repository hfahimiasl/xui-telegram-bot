import * as Callback from '../telegram/callback';
import { QueryData } from './list';
import config from '../config';

export default class extends Callback.default {
	#data: QueryData = {} as QueryData;

	get key() {
		return 'deleteack';
	}

	readonly return: Callback.QueryReturn = () => [];

	readonly markup: Callback.QueryMarkup = async () => {
		return {
			inline_keyboard: [
				[
					{
						text: 'بلی',
						callback_data: Callback.default.encode(
							'delete',
							JSON.stringify(this.#data),
						),
					},
					{
						text: 'خیر',
						callback_data: Callback.default.encode(
							'inbound',
							JSON.stringify(this.#data),
						),
					},
				],
			],
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

		telegram.editMessageText(`اکانت ${this.#data.id} حذف شود؟`, {
			reply_markup: await this.markup(query.from),
			...Callback.default.option(query),
		});
	};
}
