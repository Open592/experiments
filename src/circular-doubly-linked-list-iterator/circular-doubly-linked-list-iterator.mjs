class LinkedEntry {
	/**
	 * @type {LinkedEntry?}
	 */
	next;

	/**
	 * @type {LinkedEntry?}
	 */
	previous;

	/**
	 * @type {number}
	 */
	hashKey;

	constructor() {
		this.next = null;
		this.previous = null;
		this.hashKey = 0;
	}

	/**
	 * @returns {boolean}
	 */
	hasNext() {
		return this.next !== null;
	}

	popSelf() {
		if (this.next !== null) {
			this.next.previous = this.previous;
			this.previous.next = this.next;

			this.previous = null;
			this.next = null;
		}
	}
}

export class ContextualEntry extends LinkedEntry {
	/**
	 * @type {number}
	 */
	context;

	/**
	 * @type {ContextualEntry?}
	 */
	previousContext;

	/**
	 * @type {ContextualEntry?}
	 */
	nextContext;

	constructor() {
		super();

		this.context = 0;
		this.previousContext = null;
		this.nextContext = null;
	}

	/**
	 * @returns {boolean}
	 */
	hasNextContext() {
		return this.nextContext !== null;
	}

	popContextEntry() {
		if (this.nextContext !== null) {
			this.nextContext.previousContext = this.previousContext;
			this.previousContext.nextContext = this.nextContext;

			this.previousContext = null;
			this.nextContext = null;
		}
	}
}

export class CircularDoublyLinkedListIterator {
	/**
	 * @type {ContextualEntry?}
	 */
	#nextEntryPointer;

	/**
	 * @type {ContextualEntry}
	 */
	#sentinelEntry = new ContextualEntry();

	constructor() {
		this.#sentinelEntry.nextContext = this.#sentinelEntry;
		this.#sentinelEntry.previousContext = this.#sentinelEntry;
	}

	clear() {
		while (true) {
			const current = this.#sentinelEntry.previousContext;

			if (this.#sentinelEntry === current) {
				this.#nextEntryPointer = null;

				return;
			}

			current?.popContextEntry();
		}
	}

	/**
	 *
	 * @param {ContextualEntry} entry
	 */
	addEntry(entry) {
		if (entry.nextContext !== null) {
			entry.popContextEntry();
		}

		entry.previousContext = this.#sentinelEntry;
		entry.nextContext = this.#sentinelEntry.nextContext;
		entry.nextContext.previousContext = entry;
		entry.previousContext.nextContext = entry;
	}

	/**
	 * @returns {ContextualEntry?}
	 */
	head() {
		const head = this.#sentinelEntry.previousContext;

		if (head === this.#sentinelEntry) {
			this.#nextEntryPointer = null;

			return null;
		}

		this.#nextEntryPointer = head?.previousContext;

		return head;
	}

	/**
	 * @returns {ContextualEntry?}
	 */
	removeHead() {
		const head = this.#sentinelEntry.previousContext;

		if (this.#sentinelEntry === head) {
			return null;
		}

		head.popContextEntry();

		return head;
	}

	/**
	 *
	 * @returns {ContextualEntry}
	 */
	nextEntry() {
		const nextEntry = this.#nextEntryPointer;

		if (this.#sentinelEntry === nextEntry) {
			this.#nextEntryPointer = null;

			return null;
		}

		this.#nextEntryPointer = nextEntry.previousContext;

		return nextEntry;
	}

	/**
	 * @returns {number}
	 */
	entryCount() {
		let count = 0;
		let currentEntry = this.#sentinelEntry.previousContext;

		while (currentEntry !== this.#sentinelEntry) {
			currentEntry = currentEntry.previousContext;
			count++;
		}

		return count;
	}
}
