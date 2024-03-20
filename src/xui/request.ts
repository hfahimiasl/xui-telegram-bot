import axios from 'axios';

export default abstract class {
	static readonly get = async (url: string, headers?: any) => {
		return await axios.get(`${url}`, {
			headers,
		});
	};

	static readonly post = async (url: string, headers?: any, data?: any) => {
		return await axios.post(`${url}`, data, {
			headers,
		});
	};
}
