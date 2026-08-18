import { getAccessToken, getServiceAccount } from "./googleAuth.js";

type FirestoreValue = Record<string, unknown>;

function base(): string {
  return `https://firestore.googleapis.com/v1/projects/${getServiceAccount().project_id}/databases/(default)/documents`;
}

async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken(["https://www.googleapis.com/auth/datastore"]);
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Firestore REST ${res.status}: ${await res.text()}`);
  }
  return res;
}

function encodeValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === "object") {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) fields[k] = encodeValue(v);
    return { mapValue: { fields } };
  }
  throw new Error(`Cannot encode value of type ${typeof value}`);
}

function decodeValue(value: Record<string, unknown>): unknown {
  if (value == null) return null;
  if ("nullValue" in value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return new Date(value.timestampValue as string);
  if ("mapValue" in value) {
    const mapValue = value.mapValue as { fields?: Record<string, FirestoreValue> };
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(mapValue.fields ?? {})) obj[k] = decodeValue(v);
    return obj;
  }
  return null;
}

export interface FirestoreDoc {
  id: string;
  [key: string]: unknown;
}

function decodeDocument(doc: { name: string; fields?: Record<string, FirestoreValue> }): FirestoreDoc {
  const id = doc.name.split("/").pop()!;
  const data: FirestoreDoc = { id };
  for (const [k, v] of Object.entries(doc.fields ?? {})) data[k] = decodeValue(v);
  return data;
}

function encodeFields(data: Record<string, unknown>): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(data)) fields[k] = encodeValue(v);
  return fields;
}

/** Reads a single document by path, or null if it doesn't exist. */
export async function getDocument(path: string): Promise<FirestoreDoc | null> {
  const token = await getAccessToken(["https://www.googleapis.com/auth/datastore"]);
  const res = await fetch(`${base()}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Firestore REST ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { name: string; fields?: Record<string, FirestoreValue> };
  return decodeDocument(json);
}

/** Lists every document in a top-level collection (paginated automatically). */
export async function listCollection(collectionPath: string): Promise<FirestoreDoc[]> {
  const results: FirestoreDoc[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(`${base()}/${collectionPath}`);
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await authFetch(url.toString());
    const json = (await res.json()) as {
      documents?: Array<{ name: string; fields?: Record<string, FirestoreValue> }>;
      nextPageToken?: string;
    };
    for (const doc of json.documents ?? []) results.push(decodeDocument(doc));
    pageToken = json.nextPageToken;
  } while (pageToken);

  return results;
}

/**
 * Runs a structured query filtering a collection by one or more equality
 * checks (ANDed together — Firestore serves pure-equality compound filters
 * off the automatic single-field indexes, no composite index needed). Use
 * this instead of listCollection()+JS filter whenever the field(s) are
 * known ahead of time — it's the difference between paying for a read per
 * document in the WHOLE collection vs. just the matching ones, which matters
 * a lot for collections polled every few seconds (e.g. outboundSms).
 */
export async function queryEqual(
  collectionId: string,
  filters: Record<string, unknown>
): Promise<FirestoreDoc[]> {
  const fieldFilters = Object.entries(filters).map(([fieldPath, value]) => ({
    fieldFilter: {
      field: { fieldPath },
      op: "EQUAL",
      value: encodeValue(value),
    },
  }));

  const where =
    fieldFilters.length === 1
      ? fieldFilters[0]
      : { compositeFilter: { op: "AND", filters: fieldFilters } };

  const res = await authFetch(`${base()}:runQuery`, {
    method: "POST",
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        where,
      },
    }),
  });

  const json = (await res.json()) as Array<{
    document?: { name: string; fields?: Record<string, FirestoreValue> };
  }>;
  return json.filter((r) => r.document).map((r) => decodeDocument(r.document!));
}

/**
 * Runs a structured query combining equality filter(s) with a
 * less-than-or-equal filter on a different field — e.g. "this tenant's
 * customers whose bundleExpiry has already passed a cutoff". Unlike
 * queryEqual, this needs a composite index (the equality field(s) plus the
 * range field, all ascending) — Firestore rejects the query with a
 * FAILED_PRECONDITION until one exists, so callers should be ready for this
 * to throw on a fresh collection.
 */
export async function queryEqualWithRange(
  collectionId: string,
  equalityFilters: Record<string, unknown>,
  range: { fieldPath: string; lessThanOrEqual: Date }
): Promise<FirestoreDoc[]> {
  const filters = [
    ...Object.entries(equalityFilters).map(([fieldPath, value]) => ({
      fieldFilter: { field: { fieldPath }, op: "EQUAL", value: encodeValue(value) },
    })),
    {
      fieldFilter: {
        field: { fieldPath: range.fieldPath },
        op: "LESS_THAN_OR_EQUAL",
        value: encodeValue(range.lessThanOrEqual),
      },
    },
  ];

  const res = await authFetch(`${base()}:runQuery`, {
    method: "POST",
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        where: { compositeFilter: { op: "AND", filters } },
      },
    }),
  });

  const json = (await res.json()) as Array<{
    document?: { name: string; fields?: Record<string, FirestoreValue> };
  }>;
  return json.filter((r) => r.document).map((r) => decodeDocument(r.document!));
}

/** Full overwrite of a document (creates it if it doesn't exist). */
export async function setDocument(path: string, data: Record<string, unknown>): Promise<void> {
  await authFetch(`${base()}/${path}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: encodeFields(data) }),
  });
}

/** Deletes a document. No-ops (does not throw) if it doesn't exist. */
export async function deleteDocument(path: string): Promise<void> {
  const token = await getAccessToken(["https://www.googleapis.com/auth/datastore"]);
  const res = await fetch(`${base()}/${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Firestore REST ${res.status}: ${await res.text()}`);
  }
}

/** Creates a new document in a collection with an auto-generated ID, returning that ID. */
export async function addDocument(
  collectionPath: string,
  data: Record<string, unknown>
): Promise<string> {
  const res = await authFetch(`${base()}/${collectionPath}`, {
    method: "POST",
    body: JSON.stringify({ fields: encodeFields(data) }),
  });
  const json = (await res.json()) as { name: string };
  return json.name.split("/").pop()!;
}

/** Merges only the given fields into an existing document. */
export async function updateFields(path: string, data: Record<string, unknown>): Promise<void> {
  const url = new URL(`${base()}/${path}`);
  for (const key of Object.keys(data)) url.searchParams.append("updateMask.fieldPaths", key);

  await authFetch(url.toString(), {
    method: "PATCH",
    body: JSON.stringify({ fields: encodeFields(data) }),
  });
}

/**
 * Atomically increments numeric fields on a document (creating them,
 * starting from 0, if absent). Unlike updateFields' plain overwrite, this is
 * safe under concurrent webhook calls — two simultaneous top-ups both land
 * instead of one clobbering the other's read-modify-write.
 */
export async function incrementFields(
  path: string,
  increments: Record<string, number>
): Promise<void> {
  await authFetch(`${base()}:commit`, {
    method: "POST",
    body: JSON.stringify({
      writes: [
        {
          transform: {
            document: `projects/${getServiceAccount().project_id}/databases/(default)/documents/${path}`,
            fieldTransforms: Object.entries(increments).map(([fieldPath, value]) => ({
              fieldPath,
              increment: encodeValue(value),
            })),
          },
        },
      ],
    }),
  });
}
