/**
 * Represents a single node in the hash map.
 */
export class LinkedHashEntry {
	next;
	previous;
	hashKey;
	name;

	constructor(name) {
		this.next = null;
		this.previous = null;
		this.hashKey = 0;
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
	foundEntryPointer;
	lastProvidedHashKey;
	currentIterationValue;
	currentBucketIndex = 0;
	buckets;
	bucketCount;

	/**
	 * Constructs as `LinkedHashMapIterator`
	 *
	 * Note: Our index resolution expects `bucketCount` to be a power of 2. I
	 * have validated that this is respected within the client code.
	 *
	 * @param {number} bucketCount
	 */
	constructor(bucketCount) {
		this.buckets = new Array(bucketCount);
		this.bucketCount = bucketCount;

		for (let i = 0; i < bucketCount; i++) {
			this.buckets[i] = new LinkedHashEntry();

			const sentinalEntry = this.buckets[i];

			sentinalEntry.previous = sentinalEntry;
			sentinalEntry.next = sentinalEntry;
		}
	}

	/**
	 * Returns the least recently added element with the provided hash key. If
	 * none can be found `null` is returned.
	 *
	 * @param {number} hashKey
	 * @returns {LinkedHashEntry?}
	 */
	get(hashKey) {
		this.lastProvidedHashKey = hashKey;

		const sentinalEntry = this.buckets[hashKey & (this.bucketCount - 1)];

		for (
			this.foundEntryPointer = sentinalEntry.previous;
			this.foundEntryPointer !== sentinalEntry;
			this.foundEntryPointer = this.foundEntryPointer.previous
		) {
			if (hashKey === this.foundEntryPointer.hashKey) {
				const ret = this.foundEntryPointer;

				this.foundEntryPointer = this.foundEntryPointer.previous;

				return ret;
			}
		}

		this.foundEntryPointer = null;

		return null;
	}

	/**
	 * Returns the next entry found with the key used in the previous call to
	 * `get()`. If no more entries are found `null` is returned.
	 *
	 * @returns {LinkedHashEntry?}
	 */
	nextFoundEntry() {
		if (this.foundEntryPointer === null) {
			return null;
		}

		const sentinalEntry =
			this.buckets[this.lastProvidedHashKey & (this.bucketCount - 1)];

		while (sentinalEntry !== this.foundEntryPointer) {
			if (this.lastProvidedHashKey === this.foundEntryPointer.hashKey) {
				const ret = this.foundEntryPointer;

				this.foundEntryPointer = this.foundEntryPointer.previous;

				return ret;
			}

			this.foundEntryPointer = this.foundEntryPointer.previous;
		}

		this.foundEntryPointer = null;

		return null;
	}

	/**
	 * Returns the count of entries in the hash map across all the buckets.
	 *
	 * @returns {number}
	 */
	entryCount() {
		let count = 0;

		for (let i = 0; i < this.bucketCount; i++) {
			const sentinalEntry = this.buckets[i];
			let currentEntry = sentinalEntry.previous;

			while (sentinalEntry !== currentEntry) {
				currentEntry = currentEntry.previous;

				count++;
			}
		}

		return count;
	}

	/**
	 * Clears the entries in the hash map.
	 */
	clear() {
		for (let i = 0; i < this.bucketCount; i++) {
			const sentinalEntry = this.buckets[i];

			while (true) {
				const currentEntry = sentinalEntry.previous;

				if (currentEntry === sentinalEntry) {
					break;
				}

				currentEntry.popSelf();
			}
		}

		this.foundEntry = null;
		this.currentIterationValue = null;
	}

	/**
	 * Sets a new entry in the hash map with the provided hash key.
	 *
	 * @param {number} hashKey
	 * @param {LinkedHashEntry} entry
	 */
	set(hashKey, entry) {
		if (entry.hasNext() !== null) {
			entry.popSelf();
		}

		const sentinalEntry = this.buckets[hashKey & (this.bucketCount - 1)];

		entry.previous = sentinalEntry;
		entry.next = sentinalEntry.next;
		entry.next.previous = entry;
		entry.hashKey = hashKey;
		entry.previous.next = entry;
	}

	/**
	 * Returns the next least recently used entry.
	 *
	 * @returns {LinkedHashEntry?}
	 */
	nextEntry() {
		let ret = null;

		if (
			this.currentBucketIndex > 0 &&
			this.currentIterationValue !== this.buckets[this.currentBucketIndex - 1]
		) {
			ret = this.currentIterationValue;

			this.currentIterationValue = ret.previous;

			return ret;
		}

		while (this.currentBucketIndex < this.bucketCount) {
			ret = this.buckets[this.currentBucketIndex++].previous;

			if (this.buckets[this.currentBucketIndex - 1] !== ret) {
				this.currentIterationValue = ret.previous;

				return ret;
			}
		}

		return null;
	}

	/**
	 * Returns the least recently added entry.
	 *
	 * @returns {LinkedHashEntry?}
	 */
	head() {
		this.currentBucketIndex = 0;

		return this.nextEntry();
	}

	/**
	 * Returns the number of buckets available.
	 *
	 * @returns {number}
	 */
	size() {
		return this.bucketCount;
	}

	/**
	 * Adds the linked hash map's entries to the provided array, returning the
	 * count of entries added to the array.
	 *
	 * @param {Array} result Array which will be populated with the current
	 * entries.
	 * @returns {number} The count of entries added to the array.
	 */
	toArray(result) {
		let size = 0;

		for (let i = 0; i < this.bucketCount; i++) {
			const sentinalEntry = this.buckets[i];

			for (
				let node = sentinalEntry.previous;
				node !== sentinalEntry;
				node = node.previous
			) {
				result[size++] = node;
			}
		}

		return size;
	}
}
