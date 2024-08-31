import { describe, expect, test } from "vitest";

import {
	ContextualEntry,
	CircularDoublyLinkedListIterator,
} from "./circular-doubly-linked-list-iterator.mjs";

/**
 * Helper to create contextual entries with ids.
 *
 * @param {number} id
 * @returns {ContextualEntry}
 */
function createContextualEntryWithId(id) {
	const entry = new ContextualEntry();

	entry.context = id;

	return entry;
}

describe("circular-doubly-linked-list-iterator", () => {
	test("should initialize a list with a count of zero", () => {
		const dll = new CircularDoublyLinkedListIterator();

		expect(dll.entryCount()).toEqual(0);
	});

	test("should properly peek the first element in the list", () => {
		const expectedId = 0;
		const dll = new CircularDoublyLinkedListIterator();

		dll.addEntry(createContextualEntryWithId(expectedId));

		expect(dll.head().context).toEqual(expectedId);
		expect(dll.entryCount()).toEqual(1);
		expect(dll.head().context).toEqual(expectedId);
	});

	test("should properly remove the first element in the list", () => {
		const dll = new CircularDoublyLinkedListIterator();

		dll.addEntry(createContextualEntryWithId(0));
		dll.addEntry(createContextualEntryWithId(1));

		expect(dll.entryCount()).toEqual(2);
		expect(dll.removeHead().context).toEqual(0);

		expect(dll.entryCount()).toEqual(1);
		expect(dll.head().context).toEqual(1);
	});

	test("should properly clear all elements in the list", () => {
		const dll = new CircularDoublyLinkedListIterator();

		dll.addEntry(createContextualEntryWithId(0));
		dll.addEntry(createContextualEntryWithId(1));
		dll.addEntry(createContextualEntryWithId(2));

		expect(dll.entryCount()).toEqual(3);

		dll.clear();

		expect(dll.entryCount()).toEqual(0);
		expect(dll.head()).toBeNull();
	});

	test("should properly iterate through all entries in the list", () => {
		const dll = new CircularDoublyLinkedListIterator();

		dll.addEntry(createContextualEntryWithId(0));
		dll.addEntry(createContextualEntryWithId(1));
		dll.addEntry(createContextualEntryWithId(2));
		dll.addEntry(createContextualEntryWithId(3));

		for (
			let entry = dll.head(), i = 0;
			entry !== null;
			entry = dll.nextEntry(), i++
		) {
			expect(entry.context).toEqual(i);
		}
	});
});
