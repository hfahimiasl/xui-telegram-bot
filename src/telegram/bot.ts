import Telegram from 'node-telegram-bot-api';
import Callback from './callback';

export type TextListener = (
	telegram: Telegram,
	message: Telegram.Message,
	match: RegExpExecArray | null,
) => Promise<void>;

export default class Bot {
	static #admin: number;
	static #users: number[];
	readonly #telegram: Telegram;
	readonly #callback: Callback[] = [];

	constructor(token: string, admin: number, users: number[], proxy?: string) {
		Bot.#admin = admin;
		Bot.#users = users;

		this.#telegram = new Telegram(token, {
			polling: true,
			request: proxy
				? {
						url: '',
						proxy,
				  }
				: undefined,
		});

		this.#telegram.on('polling_error', (error: Error) =>
			console.error(error.message),
		);

		this.#telegram.on('webhook_error', (error: Error) =>
			console.error(error.message),
		);

		this.#telegram.on('error', (error: Error) =>
			console.error(error.message),
		);

		this.#telegram.setMyCommands([
			{ command: 'start', description: 'شروع' },
		]);

		this.#telegram.on('callback_query', async query => {
			if (await this.#authorize(query.from)) {
				const data = Callback.decode(query.data!);
				const callback = this.#callback.find(i => i.key === data.key);

				if (callback) {
					try {
						await callback.listener(this.#telegram, query, data);
					} catch (error: any) {
						this.#telegram.editMessageText(error.message, {
							reply_markup: {
								inline_keyboard: [callback.return()],
							},
							...Callback.option(query),
						});
					}
				}
			}
		});
	}

	static readonly admin = (user: Telegram.User) => user.id === this.#admin;

	readonly #authorize = async (user: Telegram.User) => {
		const access = Bot.admin(user) || Bot.#users.find(i => i === user.id);

		if (!access) {
			await this.#telegram.sendMessage(user.id, '🖕🏻😒');
		}

		return access;
	};

	readonly onText = (regexp: RegExp, listener: TextListener) => {
		this.#telegram.onText(regexp, async (message, match) => {
			if (message.from && (await this.#authorize(message.from))) {
				await listener(this.#telegram, message, match);
			}
		});
	};

	readonly onCallbackQuery = (callback: Callback) => {
		this.#callback.push(callback);
	};
}
