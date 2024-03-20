import * as uuid from 'uuid';
import Request from './request';
import * as Config from '../config';
import VMess from './vmess';
import Time from './time';

export interface Inbound {
	id: number;
	up: number;
	down: number;
	total: number;
	remark: string;
	enable: boolean;
	expiryTime: number;
	listen: string;
	port: number;
	protocol: string;
	settings: string;
	streamSettings: string;
	tag: string;
	sniffing: string;
}

export interface Account {
	link: string;
	remark: string;
}

export default abstract class {
	static readonly #url = (server: Config.Server) =>
		`http://${server.host}:${server.port}`;

	static readonly #login = async (server: Config.Server) => {
		const res = await Request.post(
			`${this.#url(server)}/login`,
			{},
			{
				username: server.username,
				password: server.password,
			},
		);

		if (!res.data.success) {
			throw Error('login failed');
		}

		const cookie = res.headers['set-cookie']![0];
		return cookie.slice(0, cookie.indexOf(';'));
	};

	static readonly #logout = async (server: Config.Server, cookie: string) => {
		await Request.get(`${this.#url(server)}/logout`, {
			cookie,
		});
	};

	static readonly #alloc = async (server: Config.Server) => {
		const res = await this.list(server);

		for (let i = server.ufw.start; i <= server.ufw.end; ++i) {
			if (!res.find(value => value.port === i)) {
				return i;
			}
		}

		return -1;
	};

	static readonly #settings = (id: string) => {
		return {
			clients: [
				{
					id,
					alterId: 0,
				},
			],
			disableInsecureEncryption: false,
		};
	};

	static readonly #streamSettings = () => {
		return {
			network: 'ws',
			security: 'none',
			wsSettings: {
				path: '/',
				headers: {},
			},
		};
	};

	static readonly #sniffing = () => {
		return {
			enabled: true,
			destOverride: ['http', 'tls'],
		};
	};

	static readonly capacity = (server: Config.Server) =>
		server.ufw.end - server.ufw.start + 1;

	static readonly reserved = async (server: Config.Server) =>
		(await this.list(server)).length;

	static readonly free = async (server: Config.Server) => {
		const i = this.capacity(server) - (await this.reserved(server));
		return i > 0 ? i : 0;
	};

	static readonly expired = (inbound: Inbound) =>
		inbound.total - (inbound.up + inbound.down) <= 0 ||
		Time.expired(inbound.expiryTime);

	static readonly list = async (
		server: Config.Server,
	): Promise<Inbound[]> => {
		const cookie = await this.#login(server);

		const res = await Request.post(
			`${this.#url(server)}/xui/inbound/list`,
			{
				cookie,
			},
		);

		if (!res.data.success) {
			throw Error('list failed');
		}

		await this.#logout(server, cookie);

		return res.data.obj;
	};

	static readonly find = async (server: Config.Server, id: number) => {
		const list = await this.list(server);
		return list.find(i => i.id === id);
	};

	static readonly delete = async (server: Config.Server, id: number) => {
		const cookie = await this.#login(server);

		const res = await Request.post(
			`${this.#url(server)}/xui/inbound/del/${id}`,
			{
				cookie,
			},
		);

		if (!res.data.success) {
			throw Error('delete failed');
		}

		await this.#logout(server, cookie);
	};

	static readonly add = async (server: Config.Server): Promise<Account> => {
		const port = await this.#alloc(server);

		if (port === -1) {
			throw Error('alloc failed');
		}

		const id = uuid.v4();
		const remark = `${port}-${server.tag}`;
		const cookie = await this.#login(server);
		const res = await Request.post(
			`${this.#url(server)}/xui/inbound/add`,
			{
				cookie,
			},
			{
				total: server.traffic,
				remark,
				enable: true,
				expiryTime: Time.expiry(server.expire),
				port,
				protocol: 'vmess',
				settings: JSON.stringify(this.#settings(id)),
				streamSettings: JSON.stringify(this.#streamSettings()),
				sniffing: JSON.stringify(this.#sniffing()),
			} as Inbound,
		);

		await this.#logout(server, cookie);

		if (!res.data.success) {
			throw Error('add failed');
		}

		return {
			remark,
			link: VMess.gen({
				v: '2',
				ps: remark,
				add: server.host,
				port: port,
				id,
				aid: 0,
				net: 'ws',
				type: 'none',
				host: '',
				path: '/',
				tls: 'none',
			}),
		};
	};

	static readonly update = async (
		server: Config.Server,
		id: number,
		partial: Partial<Inbound>,
	) => {
		const inbound = await this.find(server, id);

		if (!inbound) {
			throw Error('inbound not found');
		}

		const cookie = await this.#login(server);

		const res = await Request.post(
			`${this.#url(server)}/xui/inbound/update/${id}`,
			{
				cookie,
			},
			{
				...inbound,
				...partial,
			} as Inbound,
		);

		if (!res.data.success) {
			throw Error('update failed');
		}

		await this.#logout(server, cookie);
	};
}
