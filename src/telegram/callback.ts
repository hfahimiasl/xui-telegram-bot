import Telegram from 'node-telegram-bot-api';

export type QueryReturn = (value?: string) => Telegram.InlineKeyboardButton[];

export type QueryMarkup = (
	user: Telegram.User,
	data?: any,
) => Promise<Telegram.InlineKeyboardMarkup>;

export interface QueryData {
	key: string;
	value: string;
}

export type QueryListener = (
	telegram: Telegram,
	query: Telegram.CallbackQuery,
	data: QueryData,
) => Promise<void>;

export default abstract class {
	abstract get key(): string;

	abstract return: QueryReturn;
	abstract markup: QueryMarkup;
	abstract listener: QueryListener;

	static readonly encode = (key: string, value?: string) => {
		return JSON.stringify({ key, value } as QueryData);
	};

	static readonly decode = (data: string) => {
		return JSON.parse(data) as QueryData;
	};

	static readonly return = (
		key: string,
		value?: string,
	): Telegram.InlineKeyboardButton[] => {
		return [
			{
				text: 'بازگشت',
				callback_data: this.encode(key, value),
			},
		];
	};

	static readonly option = (
		query: Telegram.CallbackQuery,
	): Telegram.EditMessageTextOptions => {
		return {
			chat_id: query.message?.chat.id,
			message_id: query.message?.message_id,
		};
	};
}
