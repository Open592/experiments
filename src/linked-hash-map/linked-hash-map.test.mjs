import { describe, expect, test } from "vitest";

import { LinkedHashEntry, LinkedHashMapIterator } from "./linked-hash-map.mjs";

describe("linked-hash-map", () => {
	test("should initialize a linked hash map with the correct size", () => {
		const expectedSize = 10;
		const lhm = new LinkedHashMapIterator(expectedSize);

		expect(lhm.count()).toEqual(expectedSize);
	});

	test("should return a value when added to the hash map", () => {
		const expectedName = "test";
		const lhm = new LinkedHashMapIterator(16);

		lhm.set(5, new LinkedHashEntry(expectedName));

		expect(lhm.get(5).name).toEqual(expectedName);
	});

	test("should handle key collisions", () => {
		const lhm = new LinkedHashMapIterator(16);

		lhm.set(5, new LinkedHashEntry("one"));
		lhm.set(5, new LinkedHashEntry("two"));

		const entry = lhm.get(5);

		// Upon hash collision return first insertion
		expect(entry.name).toEqual("one");
		// It's previous value should be most recently inserted
		expect(entry.previous.name).toEqual("two");
		// It's next value should be unset
		expect(entry.next.name).toBeNull();
	});

	test("should handle small bucket size", () => {
		const lhm = new LinkedHashMapIterator(2);

		lhm.set(1, new LinkedHashEntry("one"));
		lhm.set(2, new LinkedHashEntry("two"));
		lhm.set(3, new LinkedHashEntry("three"));

		expect(lhm.get(1).name).toEqual("one");
		expect(lhm.get(2).name).toEqual("two");
		expect(lhm.get(3).name).toEqual("three");
	});

	test("should handle multiple keys", () => {
		const lhm = new LinkedHashMapIterator(8);

		lhm.set(1, new LinkedHashEntry("one"));
		lhm.set(2, new LinkedHashEntry("two"));

		const one = lhm.get(1);
		const two = lhm.get(2);

		expect(one.name).toEqual("one");
		// It should not have any previous or next values
		expect(one.next).toEqual(one.previous);
		expect(one.next.name).toBeNull();
		expect(one.previous.name).toBeNull();

		expect(two.name).toEqual("two");
		// It should not have any previous or next values
		expect(two.next).toEqual(two.previous);
		expect(two.next.name).toBeNull();
		expect(two.previous.name).toBeNull();
	});

	test("should correctly return the number of entries", () => {
		const lhm = new LinkedHashMapIterator(8);

		lhm.set(1, new LinkedHashEntry("one"));
		lhm.set(2, new LinkedHashEntry("two"));
		lhm.set(2, new LinkedHashEntry("two-one"));
		lhm.set(3, new LinkedHashEntry("three"));

		expect(lhm.countNodes()).toEqual(4);
	});

	test("should correctly clear the hash map when calling clear()", () => {
		const lhm = new LinkedHashMapIterator(8);

		lhm.set(1, new LinkedHashEntry("one"));
		lhm.set(2, new LinkedHashEntry("two"));
		lhm.set(2, new LinkedHashEntry("two-one"));
		lhm.set(3, new LinkedHashEntry("three"));

		expect(lhm.countNodes()).toEqual(4);

		lhm.clear();

		expect(lhm.countNodes()).toEqual(0);
	});

	test("should return least recently inserted element when calling head()", () => {
		const lhm = new LinkedHashMapIterator(8);

		lhm.set(1, new LinkedHashEntry("one"));
		lhm.set(2, new LinkedHashEntry("two"));
		lhm.set(2, new LinkedHashEntry("two-one"));
		lhm.set(3, new LinkedHashEntry("three"));

		const head = lhm.head();

		expect(head.name).toEqual("one");
	});

	test("should iterate through the elements, starting from the least recently inserted", () => {
		const items = ["one", "two", "three", "four"];
		const lhm = new LinkedHashMapIterator(8);

		items.forEach((item, i) => {
			lhm.set(i + 1, new LinkedHashEntry(item));
		});

		for (let entry = lhm.head(); entry !== null; entry = lhm.next()) {
			const hash = entry.id;
			const expectedValue = items[hash - 1];

			expect(entry.name).toEqual(expectedValue);
		}
	});

	test("should iterate through entry list, starting from the least recently inserted", () => {
		const items = ["one-one", "one-two", "one-three", "one-four"];
		const lhm = new LinkedHashMapIterator(8);

		items.forEach((item, i) => {
			lhm.set(1, new LinkedHashEntry(item));
		});

		let i = -1;
		for (
			let entry = lhm.get(i);
			entry !== null;
			entry = lhm.getNextHashCollision()
		) {
			const expectedValue = items[i++];

			expect(entry.name).toEqual(expectedValue);
		}
	});

	test("should place entries into provided array, starting from least recently inserted", () => {
		const items = ["one", "two", "three", "four"];
		const lhm = new LinkedHashMapIterator(8);

		items.forEach((item, i) => {
			lhm.set(i + 1, new LinkedHashEntry(item));
		});

		const array = [];

		const size = lhm.toArray(array);

		expect(size).toEqual(items.length);

		array.forEach((arrayItem, i) => {
			expect(arrayItem.name).toEqual(items[i]);
		});
	});
});
