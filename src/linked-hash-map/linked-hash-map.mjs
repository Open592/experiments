/**
 * Represents a single node in the hash map.
 */
export class LinkedHashEntry {
	next;

	previous;

	id;

	name;

	constructor(name) {
		this.next = null;
		this.previous = null;
		this.id = 0;
		this.name = name ? name : null;
	}

	hasNext() {
		return this.next !== null;
	}

	popSelf() {
		if (this.next != null) {
			this.next.previous = this.previous;
			this.previous.next = this.next;

			this.previous = null;
			this.next = null;
		}
	}
}

export class LinkedHashMapIterator {
	hashMatch;

	hash;

	iterableHead;

	currentBucketIndex = 0;

	buckets;

	bucketCount;

	/**
	 * Note: Our index resolution expects `bucketCount` to be a power of 2. I
	 * have validated that this is respected within the client code.
	 *
	 * @param {number} bucketCount
	 */
	constructor(bucketCount) {
		this.buckets = [];
		this.bucketCount = bucketCount;

		for (let i = 0; i < bucketCount; i++) {
			this.buckets[i] = new LinkedHashEntry();

			const bucket = this.buckets[i];

			bucket.previous = bucket;
			bucket.next = bucket;
		}
	}

	get(hash) {
		this.hash = hash;

		const bucket = this.buckets[hash & (this.bucketCount - 1)];

		for (
			this.hashMatch = bucket.previous;
			this.hashMatch !== bucket;
			this.hashMatch = this.hashMatch.previous
		) {
			if (hash === this.hashMatch.id) {
				const ret = this.hashMatch;

				this.hashMatch = this.hashMatch.previous;

				return ret;
			}
		}

		this.hashMatch = null;

		return null;
	}

	getNextHashCollision() {
		if (this.hashMatch === null) {
			return null;
		}

		const node = this.buckets[this.hash & (this.bucketCount - 1)];

		while (node !== this.hashMatch) {
			if (this.hash === this.hashMatch.id) {
				const ret = this.hashMatch;

				this.hashMatch = this.hashMatch.previous;

				return ret;
			}

			this.hashMatch = this.hashMatch.previous;
		}

		this.hashMatch = null;

		return null;
	}

	countNodes() {
		let count = 0;

		for (let i = 0; i < this.bucketCount; i++) {
			const currentNode = this.buckets[i];
			let previousNode = currentNode.previous;

			while (currentNode !== previousNode) {
				previousNode = previousNode.previous;

				count++;
			}
		}

		return count;
	}

	clear() {
		for (let i = 0; i < this.bucketCount; i++) {
			const current = this.buckets[i];

			while (true) {
				const previous = current.previous;

				if (previous === current) {
					break;
				}

				previous.popSelf();
			}
		}

		this.hashMatch = null;
		this.iterableHead = null;
	}

	set(hash, node) {
		if (node.next !== null) {
			node.popSelf();
		}

		const index = hash & (this.bucketCount - 1);
		const bucket = this.buckets[index];

		node.previous = bucket;
		node.next = bucket.next;
		node.next.previous = node;
		node.id = hash;
		node.previous.next = node;
	}

	next() {
		let ret = null;

		if (
			this.currentBucketIndex > 0 &&
			this.iterableHead !== this.buckets[this.currentBucketIndex - 1]
		) {
			ret = this.iterableHead;

			this.iterableHead = ret.previous;

			return ret;
		}

		while (this.currentBucketIndex < this.bucketCount) {
			ret = this.buckets[this.currentBucketIndex++].previous;

			if (this.buckets[this.currentBucketIndex - 1] !== ret) {
				this.iterableHead = ret.previous;

				return ret;
			}
		}

		return null;
	}

	head() {
		this.currentBucketIndex = 0;

		return this.next();
	}

	count() {
		return this.bucketCount;
	}

	toArray(result) {
		let size = 0;

		for (let i = 0; i < this.bucketCount; i++) {
			const bucket = this.buckets[i];

			for (let node = bucket.previous; node !== bucket; node = node.previous) {
				result[size++] = node;
			}
		}

		return size;
	}
}
