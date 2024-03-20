interface Data {
	v: string;
	ps: string;
	add: string;
	port: number;
	id: string;
	aid: number;
	net: string;
	type: string;
	host: string;
	path: string;
	tls: string;
}

export default abstract class {
	static readonly gen = (data: Data) =>
		`vmess://${Buffer.from(JSON.stringify(data, null, 2)).toString(
			'base64',
		)}`;
}
