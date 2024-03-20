export default abstract class {
	static readonly expiry = (sec: number) => Date.now() + sec * 1000;
	static readonly expired = (msec: number) => Date.now() - msec >= 0;
	static readonly toString = (sec: number) => {
		if (Math.abs(sec) < 60) {
			return `${sec.toFixed(0)} ثانیه`;
		}

		if (Math.abs(sec) < 3600) {
			return `${(sec / 60).toFixed(0)} دقیقه`;
		}

		if (Math.abs(sec) < 3600 * 24) {
			return `${(sec / 3600).toFixed(0)} ساعت`;
		}

		return `${(sec / 3600 / 24).toFixed(0)} روز`;
	};
}
