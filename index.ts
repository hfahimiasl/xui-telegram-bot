import dotenv from 'dotenv';
import path from 'path';
import db from './src/db';
import config from './src/config';
import qrcode from './src/xui/qrcode';
import { Bot } from './src/telegram';
import * as Menu from './src/menu';

dotenv.config();

config.load(path.resolve(__dirname, 'config.json'));
qrcode.set(path.resolve(__dirname, 'qr.jpeg'));
db.set(path.resolve(__dirname, 'db.json'));

const bot = new Bot(
	String(process.env.TOKEN),
	Number(process.env.ADMIN),
	process.env.USERS
		? String(process.env.USERS)
				.split(',')
				.map(value => +value)
		: [],
	process.env.PROXY ? String(process.env.PROXY) : undefined,
);

const home = new Menu.Home();

bot.onText(/\/start/, async (telegram, message) => {
	if (message.from) {
		await telegram.sendMessage(message.chat.id, home.text(message.from), {
			reply_markup: await home.markup(message.from),
		});
	}
});

bot.onCallbackQuery(new Menu.Bill());
bot.onCallbackQuery(new Menu.Delete());
bot.onCallbackQuery(new Menu.DeleteAck());
bot.onCallbackQuery(new Menu.Disable());
bot.onCallbackQuery(new Menu.Enable());
bot.onCallbackQuery(new Menu.Extend());
bot.onCallbackQuery(home);
bot.onCallbackQuery(new Menu.Inbound());
bot.onCallbackQuery(new Menu.List());
bot.onCallbackQuery(new Menu.New());
bot.onCallbackQuery(new Menu.Panel());
bot.onCallbackQuery(new Menu.QRLink());
bot.onCallbackQuery(new Menu.Server());
