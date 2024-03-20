enum Unit {
	KB = 1024,
	MB = KB * 1024,
	GB = MB * 1024,
	TB = GB * 1024,
	PB = TB * 1024,
}

export default abstract class {
	static readonly toString = (byte: number) => {
		if (Math.abs(byte) < Unit.KB) {
			return `${byte.toFixed(0)} B`;
		}

		if (Math.abs(byte) < Unit.MB) {
			return `${(byte / Unit.KB).toFixed(2)} KB`;
		}

		if (Math.abs(byte) < Unit.GB) {
			return `${(byte / Unit.MB).toFixed(2)} MB`;
		}

		if (Math.abs(byte) < Unit.TB) {
			return `${(byte / Unit.GB).toFixed(2)} GB`;
		}

		if (Math.abs(byte) < Unit.PB) {
			return `${(byte / Unit.TB).toFixed(2)} TB`;
		}

		return `${(byte / Unit.PB).toFixed(2)} PB`;
	};
}
